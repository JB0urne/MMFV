import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import type { MovieTmdbSearchResponse } from '@mmfv/interfaces';
import { TmdbService } from './tmdb.service';

@Controller('tmdb')
export class TmdbController {
    constructor(private readonly tmdbService: TmdbService) {}

    @Get('search/movie')
    async searchMovies(
        @Query('query') query?: string,
        @Query('page') page?: string,
    ): Promise<MovieTmdbSearchResponse> {
        const trimmed = query?.trim();
        if (!trimmed) {
            throw new BadRequestException('query is required');
        }
        const pageNumber = page ? Number.parseInt(page, 10) : 1;
        return this.tmdbService.searchMovies(trimmed, Number.isFinite(pageNumber) ? pageNumber : 1);
    }
}
