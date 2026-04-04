import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

type EditMovieDialogData = {
    title: string;
    year: number;
};

type EditMovieDialogResult = {
    title: string;
    year: number;
};

@Component({
    selector: 'app-edit-movie-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    templateUrl: './edit-movie-dialog.component.html',
    styleUrl: './edit-movie-dialog.component.css',
})
export class EditMovieDialogComponent {
    title: string;
    year: number;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: EditMovieDialogData,
        private dialogRef: MatDialogRef<EditMovieDialogComponent, EditMovieDialogResult | null>,
    ) {
        this.title = data.title;
        this.year = data.year;
    }

    isValid(): boolean {
        return this.title.trim().length > 0 && Number.isFinite(this.year);
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }

    onSave(): void {
        if (!this.isValid()) {
            return;
        }
        this.dialogRef.close({
            title: this.title.trim(),
            year: this.year,
        });
    }
}
