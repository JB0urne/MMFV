import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ApiMessage {
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MMFV';
  angularVersion = '18';
  apiResponse: ApiMessage | null = null;
  error: string | null = null;
  loading = false;

  constructor(private http: HttpClient) {}

  testApi() {
    this.loading = true;
    this.error = null;
    this.apiResponse = null;

    this.http.get<ApiMessage>('/api/message')
      .subscribe({
        next: (response) => {
          this.apiResponse = response;
          this.loading = false;
        },
        error: (err) => {
          this.error = `Failed to connect to API: ${err.message}`;
          this.loading = false;
        }
      });
  }
}

