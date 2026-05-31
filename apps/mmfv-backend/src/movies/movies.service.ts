import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Movie } from '@mmfv/interfaces';
import { SqliteService } from '../database/sqlite.service';

@Injectable()
export class MoviesService {
    constructor(private readonly sqlite: SqliteService) {}

    create(createMovieDto: { title: string; imdbId: string; year: number }): Movie {
        const now = new Date().toISOString();
        const id = randomUUID();
        this.sqlite.database
            .prepare(
                `INSERT INTO movies (id, title, imdb_id, year, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .run(id, createMovieDto.title, createMovieDto.imdbId, createMovieDto.year, now, now);
        return this.findOneByImdbId(createMovieDto.imdbId) as Movie;
    }

    findAll(): Movie[] {
        const rows = this.sqlite.database
            .prepare(
                `SELECT id, title, imdb_id, year, created_at, updated_at FROM movies ORDER BY title`,
            )
            .all() as Array<{
            id: string;
            title: string;
            imdb_id: string;
            year: number;
            created_at: string | null;
            updated_at: string | null;
        }>;
        return rows.map((r) => this.sqlite.rowToMovie(r));
    }

    update(
        id: string,
        updateMovieDto: Partial<Movie>,
    ): Movie | null {
        const existing = this.findOneById(id);
        if (!existing) {
            return null;
        }
        const title = updateMovieDto.title ?? existing.title;
        const imdbId = updateMovieDto.imdbId ?? existing.imdbId ?? '';
        const year = updateMovieDto.year ?? existing.year ?? 0;
        const now = new Date().toISOString();
        this.sqlite.database
            .prepare(
                `UPDATE movies SET title = ?, imdb_id = ?, year = ?, updated_at = ? WHERE id = ?`,
            )
            .run(title, imdbId, year, now, id);
        return this.findOneById(id);
    }

    private findOneById(id: string): Movie | null {
        const row = this.sqlite.database
            .prepare(
                `SELECT id, title, imdb_id, year, created_at, updated_at FROM movies WHERE id = ?`,
            )
            .get(id) as
            | {
                  id: string;
                  title: string;
                  imdb_id: string;
                  year: number;
                  created_at: string | null;
                  updated_at: string | null;
              }
            | undefined;
        return row ? this.sqlite.rowToMovie(row) : null;
    }

    private findOneByImdbId(imdbId: string): Movie | null {
        const row = this.sqlite.database
            .prepare(
                `SELECT id, title, imdb_id, year, created_at, updated_at FROM movies WHERE imdb_id = ?`,
            )
            .get(imdbId) as
            | {
                  id: string;
                  title: string;
                  imdb_id: string;
                  year: number;
                  created_at: string | null;
                  updated_at: string | null;
              }
            | undefined;
        return row ? this.sqlite.rowToMovie(row) : null;
    }
}
