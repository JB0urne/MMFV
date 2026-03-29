import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqliteModule } from './database/sqlite.module';
import { MoviesModule } from './movies/movies.module';

@Module({
    imports: [SqliteModule, MoviesModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
