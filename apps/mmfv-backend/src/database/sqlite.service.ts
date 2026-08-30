import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Movie, TranslationObject } from '@mmfv/interfaces';
import { sanitizeTitles } from '@mmfv/utils';
import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

type MovieRow = {
    id: string;
    original_title: string;
    titles: string;
    tmdb_id: number | null;
    year: number | null;
    created_at: string | null;
    updated_at: string | null;
};

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
        // Keep columns aligned with Movie in @mmfv/interfaces.
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS movies (
                id TEXT PRIMARY KEY,
                original_title TEXT NOT NULL,
                titles TEXT NOT NULL DEFAULT '[]',
                tmdb_id INTEGER UNIQUE,
                year INTEGER,
                created_at TEXT,
                updated_at TEXT
            )
        `);
    }

    onModuleDestroy(): void {
        this.db?.close();
    }

    private requireEnv(key: string): string {
        const value = this.configService.get<string>(key)?.trim();
        if (!value) {
            throw new Error(`${key} is required. Copy example.env to .env and set it.`);
        }
        return value;
    }

    rowToMovie(row: MovieRow): Movie {
        return {
            id: row.id,
            originalTitle: row.original_title,
            titles: parseTitlesJson(row.titles),
            ...(row.tmdb_id != null ? { tmdbId: row.tmdb_id } : {}),
            ...(row.year != null ? { year: row.year } : {}),
            ...(row.created_at != null ? { createdAt: row.created_at } : {}),
            ...(row.updated_at != null ? { updatedAt: row.updated_at } : {}),
        };
    }
}

function parseTitlesJson(raw: string): TranslationObject[] {
    try {
        const parsed = JSON.parse(raw || '[]') as unknown;
        return sanitizeTitles(Array.isArray(parsed) ? (parsed as TranslationObject[]) : []);
    } catch {
        return [];
    }
}
