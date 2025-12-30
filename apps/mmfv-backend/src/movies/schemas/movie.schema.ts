import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MovieDocument = Movie & Document;

@Schema({ timestamps: true })
export class Movie {
    @Prop({ required: true, index: true })
    title: string = '';

    @Prop({ required: true, unique: true, index: true })
    imdbId: string = '';

    @Prop({ required: true })
    year: number = 0;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
