import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MovieRow, SqliteService } from '../database/sqlite.service';

@Injectable()
export class MoviesService {
    constructor(private readonly sqlite: SqliteService) {}

    create(createMovieDto: { title: string; imdbId: string; year: number }): MovieRow {
        const now = new Date().toISOString();
        const id = randomUUID();
        this.sqlite.database
            .prepare(
                `INSERT INTO movies (id, title, imdb_id, year, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .run(id, createMovieDto.title, createMovieDto.imdbId, createMovieDto.year, now, now);
        return this.findOne(createMovieDto.imdbId) as MovieRow;
    }

    findAll(): MovieRow[] {
        const rows = this.sqlite.database
            .prepare(
                `SELECT id, title, imdb_id, year, created_at, updated_at FROM movies ORDER BY title`,
            )
            .all() as Array<{
            id: string;
            title: string;
            imdb_id: string;
            year: number;
            created_at: string;
            updated_at: string;
        }>;
        return rows.map((r) => this.sqlite.rowToMovie(r));
    }

    findOne(imdbId: string): MovieRow | null {
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
                  created_at: string;
                  updated_at: string;
              }
            | undefined;
        return row ? this.sqlite.rowToMovie(row) : null;
    }

    findByYear(year: number): MovieRow[] {
        const rows = this.sqlite.database
            .prepare(
                `SELECT id, title, imdb_id, year, created_at, updated_at FROM movies WHERE year = ? ORDER BY title`,
            )
            .all(year) as Array<{
            id: string;
            title: string;
            imdb_id: string;
            year: number;
            created_at: string;
            updated_at: string;
        }>;
        return rows.map((r) => this.sqlite.rowToMovie(r));
    }

    update(
        imdbId: string,
        updateMovieDto: Partial<{ title: string; year: number }>,
    ): MovieRow | null {
        const existing = this.findOne(imdbId);
        if (!existing) {
            return null;
        }
        const title = updateMovieDto.title ?? existing.title;
        const year = updateMovieDto.year ?? existing.year;
        const now = new Date().toISOString();
        this.sqlite.database
            .prepare(
                `UPDATE movies SET title = ?, year = ?, updated_at = ? WHERE imdb_id = ?`,
            )
            .run(title, year, now, imdbId);
        return this.findOne(imdbId);
    }

    remove(imdbId: string): MovieRow | null {
        const existing = this.findOne(imdbId);
        if (!existing) {
            return null;
        }
        this.sqlite.database.prepare(`DELETE FROM movies WHERE imdb_id = ?`).run(imdbId);
        return existing;
    }
}
