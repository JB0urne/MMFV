import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// CommonJS export: default import compiles to `.default` and breaks with webpack externals.
import Database = require('better-sqlite3');
import { Movie, StrictMovie } from '@mmfv/interfaces';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { dirname } from 'path';

@Injectable()
export class SqliteService implements OnModuleInit, OnModuleDestroy {
    private db!: Database.Database;

    constructor(private readonly configService: ConfigService) {}

    get database(): Database.Database {
        return this.db;
    }

    onModuleInit(): void {
        const dbPath = this.requireEnv('SQLITE_PATH');
        mkdirSync(dirname(dbPath), { recursive: true });
        this.db = new Database(dbPath);
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS movies (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                tmdb_id INTEGER NOT NULL UNIQUE,
                year INTEGER NOT NULL,
                created_at TEXT,
                updated_at TEXT
            )
        `);
        this.seedFromDumpIfEmpty();
    }

    onModuleDestroy(): void {
        this.db?.close();
    }

    private seedFromDumpIfEmpty(): void {
        const count = this.db.prepare('SELECT COUNT(*) AS c FROM movies').get() as { c: number };
        if (count.c > 0) {
            return;
        }
        const seedPath = this.requireEnv('SQLITE_SEED_FILE');
        if (!existsSync(seedPath)) {
            throw new Error(`SQLITE_SEED_FILE does not exist: ${seedPath}`);
        }
        const raw = JSON.parse(readFileSync(seedPath, 'utf-8')) as StrictMovie[];
        const insert = this.db.prepare(
            `INSERT INTO movies (id, title, tmdb_id, year, created_at, updated_at)
             VALUES (@id, @title, @tmdb_id, @year, @created_at, @updated_at)`,
        );
        const tx = this.db.transaction((rows: StrictMovie[]) => {
            for (const r of rows) {
                insert.run({
                    id: r.id,
                    title: r.title,
                    tmdb_id: r.tmdbId,
                    year: r.year,
                    created_at: r.createdAt,
                    updated_at: r.updatedAt,
                });
            }
        });
        tx(raw);
    }

    private requireEnv(key: string): string {
        const value = this.configService.get<string>(key)?.trim();
        if (!value) {
            throw new Error(`${key} is required. Copy example.env to .env and set it.`);
        }
        return value;
    }

    rowToMovie(row: {
        id: string;
        title: string;
        tmdb_id: number;
        year: number;
        created_at: string | null;
        updated_at: string | null;
    }): Movie {
        return {
            id: row.id,
            title: row.title,
            tmdbId: row.tmdb_id,
            year: row.year,
            ...(row.created_at != null ? { createdAt: row.created_at } : {}),
            ...(row.updated_at != null ? { updatedAt: row.updated_at } : {}),
        };
    }
}
