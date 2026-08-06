import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqliteModule } from './database/sqlite.module';
import { MoviesModule } from './movies/movies.module';
import { TmdbModule } from './tmdb/tmdb.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        SqliteModule,
        TmdbModule,
        MoviesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
