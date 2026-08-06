import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Movie } from '@mmfv/interfaces';
import { SqliteService } from '../database/sqlite.service';

@Injectable()
export class MoviesService {
    constructor(private readonly sqlite: SqliteService) {}

    add(createMovieDto: { title: string; tmdbId: number; year: number }): Movie {
        const now = new Date().toISOString();
        const id = randomUUID();
        this.sqlite.database
            .prepare(
                `INSERT INTO movies (id, title, tmdb_id, year, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
            )
            .run(id, createMovieDto.title, createMovieDto.tmdbId, createMovieDto.year, now, now);
        return this.findOneByTmdbId(createMovieDto.tmdbId) as Movie;
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
        return rows.map((r) => this.sqlite.rowToMovie(r));
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
