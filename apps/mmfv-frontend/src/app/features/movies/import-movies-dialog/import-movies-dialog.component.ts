import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/** UI-only row status until resolve/commit is wired. */
export type ImportRowStatus = 'unresolved' | 'auto' | 'ambiguous' | 'none' | 'exists';

export type ImportMovieRow = {
    lineNumber: number;
    input: string;
    status: ImportRowStatus;
    /** Set when a TMDB match is chosen (auto or manual). */
    chosenTitle?: string;
    chosenYear?: number;
    chosenTmdbId?: number;
    /** Whether the per-row search panel is expanded. */
    searchOpen: boolean;
};

@Component({
    selector: 'app-import-movies-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './import-movies-dialog.component.html',
    styleUrl: './import-movies-dialog.component.css',
})
export class ImportMoviesDialogComponent {
    rawText = '';
    rows: ImportMovieRow[] = [];
    previewed = false;

    constructor(private dialogRef: MatDialogRef<ImportMoviesDialogComponent, null>) {}

    get lineCount(): number {
        return this.parseLines(this.rawText).length;
    }

    get autoCount(): number {
        return this.rows.filter(r => r.status === 'auto').length;
    }

    get needsReviewCount(): number {
        return this.rows.filter(r => r.status === 'ambiguous' || r.status === 'none' || r.status === 'unresolved')
            .length;
    }

    get readyCount(): number {
        return this.rows.filter(r => r.chosenTmdbId != null || r.status === 'auto').length;
    }

    onPreview(): void {
        const lines = this.parseLines(this.rawText);
        this.rows = lines.map((input, index) => ({
            lineNumber: index + 1,
            input,
            status: 'unresolved' as const,
            searchOpen: false,
        }));
        this.previewed = true;
    }

    onToggleSearch(row: ImportMovieRow): void {
        row.searchOpen = !row.searchOpen;
    }

    onClearChoice(row: ImportMovieRow): void {
        row.chosenTitle = undefined;
        row.chosenYear = undefined;
        row.chosenTmdbId = undefined;
        if (row.status === 'auto') {
            row.status = 'unresolved';
        }
    }

    statusLabel(status: ImportRowStatus): string {
        switch (status) {
            case 'auto':
                return 'Auto';
            case 'ambiguous':
                return 'Needs review';
            case 'none':
                return 'Not found';
            case 'exists':
                return 'Already in catalog';
            default:
                return 'Unresolved';
        }
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }

    onCommit(): void {
        // Resolve → commit API not wired yet; UI only.
    }

    private parseLines(text: string): string[] {
        return text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }
}
