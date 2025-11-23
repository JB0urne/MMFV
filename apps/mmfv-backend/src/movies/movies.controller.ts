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
} from '@nestjs/common';
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

  @Get('year/:year')
  async findByYear(@Param('year') year: string) {
    return this.moviesService.findByYear(parseInt(year, 10));
  }

  @Get(':imdbId')
  async findOne(@Param('imdbId') imdbId: string) {
    return this.moviesService.findOne(imdbId);
  }

  @Put(':imdbId')
  async update(
    @Param('imdbId') imdbId: string,
    @Body() updateMovieDto: Partial<{ title: string; year: number }>,
  ) {
    return this.moviesService.update(imdbId, updateMovieDto);
  }

  @Delete(':imdbId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('imdbId') imdbId: string) {
    return this.moviesService.remove(imdbId);
  }
}

