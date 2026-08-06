import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    NotFoundException,
} from '@nestjs/common';
import { Movie } from '@mmfv/interfaces';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async add(@Body() movie: Movie) {
        return this.moviesService.add(movie);
    }

    @Post('from-tmdb')
    @HttpCode(HttpStatus.CREATED)
    async addByTmdbId(@Body() body: { tmdbId: number }) {
        return this.moviesService.addByTmdbId(body.tmdbId);
    }

    @Get()
    async getMovies() {
        return this.moviesService.findAll();

    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() movie: Movie,
    ) {
        const updated = this.moviesService.update(id, movie);
        if (!updated) {
            throw new NotFoundException(`Movie with id ${id} not found`);
        }
        return updated;
    }
}
