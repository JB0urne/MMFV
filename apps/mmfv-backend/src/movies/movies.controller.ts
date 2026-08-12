import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import type {
    Movie,
    MovieImportCommitRequest,
    MovieImportPreviewRequest,
} from '@mmfv/interfaces';
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

    @Post('import/preview')
    async previewImport(@Body() body: MovieImportPreviewRequest) {
        if (!body || !Array.isArray(body.titles)) {
            throw new BadRequestException('titles must be an array of strings');
        }
        return this.moviesService.previewImport(body.titles);
    }

    @Post('import/commit')
    @HttpCode(HttpStatus.CREATED)
    async commitImport(@Body() body: MovieImportCommitRequest) {
        return this.moviesService.commitImport(body);
    }

    @Get()
    async getMovies() {
        return this.moviesService.findAll();
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() movie: Movie) {
        const updated = this.moviesService.update(id, movie);
        if (!updated) {
            throw new NotFoundException(`Movie with id ${id} not found`);
        }
        return updated;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        const removed = this.moviesService.remove(id);
        if (!removed) {
            throw new NotFoundException(`Movie with id ${id} not found`);
        }
    }
}
