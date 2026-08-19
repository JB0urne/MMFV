import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
    Movie,
    MovieImportCommitRequest,
    MovieImportCommitResponse,
    MovieImportPreviewItem,
    MovieImportPreviewResponse,
} from '@mmfv/interfaces';
import { displayMovieTitle, sanitizeTitles } from '@mmfv/utils';
import { MOVIE_IMPORT_BATCH_SIZE } from '@mmfv/constants';
import { SqliteService } from '../database/sqlite.service';
import { TmdbService } from '../tmdb/tmdb.service';
import { classifyImportTitle, yearFromReleaseDate } from './import-classify';

@Injectable()
export class MoviesService {
    constructor(
        private readonly sqlite: SqliteService,
        private readonly tmdbService: TmdbService,
    ) {}

    add(movie: Movie): Movie {
        const now = new Date().toISOString();
        const id = randomUUID();
        const originalTitle = typeof movie.originalTitle === 'string' ? movie.originalTitle.trim() : '';
        if (!originalTitle) {
            throw new BadRequestException('originalTitle is required');
        }
        const titles = sanitizeTitles(movie.titles ?? []);
        this.sqlite.database
            .prepare(
                `INSERT INTO movies (id, original_title, titles, tmdb_id, year, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
            )
            .run(
                id,
                originalTitle,
                JSON.stringify(titles),
                movie.tmdbId ?? null,
                movie.year ?? null,
                now,
                now,
            );
        return this.findOneById(id) as Movie;
    }

    async addByTmdbId(tmdbId: number): Promise<Movie> {
        const existingMovie = this.findOneByTmdbId(tmdbId);
        if (existingMovie) {
            return existingMovie;
        }
        const detailedMovie = await this.tmdbService.getMovie(tmdbId);
        return this.add(detailedMovie);
    }

    async previewImport(titles: string[]): Promise<MovieImportPreviewResponse> {
        if (!Array.isArray(titles)) {
            throw new BadRequestException('titles must be an array of strings');
        }

        const batch = titles
            .map(title => (typeof title === 'string' ? title.trim() : ''))
            .filter(title => title.length > 0)
            .slice(0, MOVIE_IMPORT_BATCH_SIZE);

        const items: MovieImportPreviewItem[] = [];

        for (let index = 0; index < batch.length; index++) {
            const input = batch[index];
            const search = await this.tmdbService.searchMovies(input);
            const classified = classifyImportTitle(input, search.results);

            const item: MovieImportPreviewItem = {
                input,
                status: classified.status,
                candidates: search.results.slice(0, 10),
            };

            if (classified.status === 'auto' && classified.match) {
                const year = yearFromReleaseDate(classified.match.releaseDate);
                item.chosenTmdbId = classified.match.id;
                item.chosenTitle = classified.match.title;
                item.chosenYear = year;

                if (this.findOneByTmdbId(classified.match.id)) {
                    item.status = 'exists';
                }
            }

            items.push(item);
        }

        return { items };
    }

    async commitImport(body: MovieImportCommitRequest): Promise<MovieImportCommitResponse> {
        if (!body || !Array.isArray(body.items)) {
            throw new BadRequestException('items must be an array');
        }

        const added: Movie[] = [];
        let skipped = 0;

        for (const item of body.items) {
            if (!item || typeof item !== 'object' || !('type' in item)) {
                throw new BadRequestException('each item must have a type');
            }

            if (item.type === 'tmdb') {
                if (!Number.isFinite(item.tmdbId)) {
                    throw new BadRequestException('tmdb items require a numeric tmdbId');
                }
                const existing = this.findOneByTmdbId(item.tmdbId);
                if (existing) {
                    skipped += 1;
                    continue;
                }
                added.push(await this.addByTmdbId(item.tmdbId));
                continue;
            }

            if (item.type === 'title') {
                const title = typeof item.title === 'string' ? item.title.trim() : '';
                if (!title) {
                    throw new BadRequestException('title items require a non-empty title');
                }
                added.push(this.add({ id: '', originalTitle: title, titles: [] }));
                continue;
            }

            throw new BadRequestException(`unknown commit item type`);
        }

        return { added, skipped };
    }

    findAll(): Movie[] {
        const rows = this.sqlite.database
            .prepare(
                `SELECT id, original_title, titles, tmdb_id, year, created_at, updated_at FROM movies`,
            )
            .all() as Array<{
            id: string;
            original_title: string;
            titles: string;
            tmdb_id: number | null;
            year: number | null;
            created_at: string | null;
            updated_at: string | null;
        }>;
        return rows
            .map(r => this.sqlite.rowToMovie(r))
            .sort((a, b) => displayMovieTitle(a).localeCompare(displayMovieTitle(b)));
    }

    update(id: string, movie: Movie): Movie | null {
        const existing = this.findOneById(id);
        if (!existing) {
            return null;
        }
        const originalTitle = typeof movie.originalTitle === 'string' ? movie.originalTitle.trim() : '';
        if (!originalTitle) {
            throw new BadRequestException('originalTitle is required');
        }
        const titles = sanitizeTitles(movie.titles ?? []);
        const now = new Date().toISOString();
        this.sqlite.database
            .prepare(
                `UPDATE movies SET original_title = ?, titles = ?, tmdb_id = ?, year = ?, updated_at = ? WHERE id = ?`,
            )
            .run(originalTitle, JSON.stringify(titles), movie.tmdbId ?? null, movie.year ?? null, now, id);
        return this.findOneById(id);
    }

    remove(id: string): boolean {
        const result = this.sqlite.database.prepare(`DELETE FROM movies WHERE id = ?`).run(id);
        return result.changes > 0;
    }

    private findOneById(id: string): Movie | null {
        const row = this.sqlite.database
            .prepare(
                `SELECT id, original_title, titles, tmdb_id, year, created_at, updated_at FROM movies WHERE id = ?`,
            )
            .get(id) as
            | {
                  id: string;
                  original_title: string;
                  titles: string;
                  tmdb_id: number | null;
                  year: number | null;
                  created_at: string | null;
                  updated_at: string | null;
              }
            | undefined;
        return row ? this.sqlite.rowToMovie(row) : null;
    }

    private findOneByTmdbId(tmdbId: number): Movie | null {
        const row = this.sqlite.database
            .prepare(
                `SELECT id, original_title, titles, tmdb_id, year, created_at, updated_at FROM movies WHERE tmdb_id = ?`,
            )
            .get(tmdbId) as
            | {
                  id: string;
                  original_title: string;
                  titles: string;
                  tmdb_id: number | null;
                  year: number | null;
                  created_at: string | null;
                  updated_at: string | null;
              }
            | undefined;
        return row ? this.sqlite.rowToMovie(row) : null;
    }
}
