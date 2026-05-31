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
    async create(@Body() createMovieDto: { title: string; imdbId: string; year: number }) {
        return this.moviesService.create(createMovieDto);
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
