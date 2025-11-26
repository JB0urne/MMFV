import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from './schemas/movie.schema';

@Injectable()
export class MoviesService {
    constructor(@InjectModel(Movie.name) private movieModel: Model<MovieDocument>) {}

    async create(createMovieDto: { title: string; imdbId: string; year: number }): Promise<Movie> {
        const createdMovie = new this.movieModel(createMovieDto);
        return createdMovie.save();
    }

    async findAll(): Promise<Movie[]> {
        return this.movieModel.find().exec();
    }

    async findOne(imdbId: string): Promise<Movie | null> {
        return this.movieModel.findOne({ imdbId }).exec();
    }

    async findByYear(year: number): Promise<Movie[]> {
        return this.movieModel.find({ year }).exec();
    }

    async update(imdbId: string, updateMovieDto: Partial<{ title: string; year: number }>): Promise<Movie | null> {
        return this.movieModel.findOneAndUpdate({ imdbId }, updateMovieDto, { new: true }).exec();
    }

    async remove(imdbId: string): Promise<Movie | null> {
        return this.movieModel.findOneAndDelete({ imdbId }).exec();
    }
}
