import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { MoviesCatalogComponent } from './features/movies/movies-catalog/movies-catalog.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [HeaderComponent, MoviesCatalogComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {}
