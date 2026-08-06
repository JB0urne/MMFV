import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Movie } from '@mmfv/interfaces';
import { SqliteService } from '../database/sqlite.service';
import { TmdbService } from '../tmdb/tmdb.service';

@Injectable()
export class MoviesService {
    constructor(
        private readonly sqlite: SqliteService,
        private readonly tmdbService: TmdbService,
    ) {}

    add(movie: Movie): Movie {
        const now = new Date().toISOString();
        const id = randomUUID();
        const tmdbId = movie.tmdbId ?? 0;
        this.sqlite.database
            .prepare(
                `INSERT INTO movies (id, title, tmdb_id, year, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .run(id, movie.title, tmdbId, movie.year ?? 0, now, now);
        return this.findOneByTmdbId(tmdbId) as Movie;
    }

    async addByTmdbId(tmdbId: number): Promise<Movie> {
        const existingMovie = this.findOneByTmdbId(tmdbId);
        if (existingMovie) {
            return existingMovie;
        }
        const detailedMovie = await this.tmdbService.getMovie(tmdbId);
        return this.add(detailedMovie);
    }

    findAll(): Movie[] {
        const rows = this.sqlite.database
            .prepare(
                `SELECT id, title, tmdb_id, year, created_at, updated_at FROM movies ORDER BY title`,
            )
            .all() as Array<{
            id: string;
            title: string;
            tmdb_id: number;
            year: number;
            created_at: string | null;
            updated_at: string | null;
        }>;
        return rows.map(r => this.sqlite.rowToMovie(r));
    }

    update(id: string, movie: Movie): Movie | null {
        const existing = this.findOneById(id);
        if (!existing) {
            return null;
        }
        const now = new Date().toISOString();
        this.sqlite.database
            .prepare(
                `UPDATE movies SET title = ?, tmdb_id = ?, year = ?, updated_at = ? WHERE id = ?`,
            )
            .run(movie.title, movie.tmdbId ?? 0, movie.year ?? 0, now, id);
        return this.findOneById(id);
    }

    private findOneById(id: string): Movie | null {
        const row = this.sqlite.database
            .prepare(
                `SELECT id, title, tmdb_id, year, created_at, updated_at FROM movies WHERE id = ?`,
            )
            .get(id) as
            | {
                  id: string;
                  title: string;
                  tmdb_id: number;
                  year: number;
                  created_at: string | null;
                  updated_at: string | null;
              }
            | undefined;
        return row ? this.sqlite.rowToMovie(row) : null;
    }

    private findOneByTmdbId(tmdbId: number): Movie | null {
        const row = this.sqlite.database
            .prepare(
                `SELECT id, title, tmdb_id, year, created_at, updated_at FROM movies WHERE tmdb_id = ?`,
            )
            .get(tmdbId) as
            | {
                  id: string;
                  title: string;
                  tmdb_id: number;
                  year: number;
                  created_at: string | null;
                  updated_at: string | null;
              }
            | undefined;
        return row ? this.sqlite.rowToMovie(row) : null;
    }
}
