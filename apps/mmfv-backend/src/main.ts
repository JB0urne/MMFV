import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Set global API prefix
    app.setGlobalPrefix('api');

    // Enable CORS for frontend communication
    app.enableCors({
        origin: 'http://localhost:4200',
        credentials: true,
    });

    const configService = app.get(ConfigService);
    const portRaw = configService.get<string>('BACKEND_PORT')?.trim();
    if (!portRaw) {
        throw new Error('PORT is required. Copy example.env to .env and set it.');
    }
    const port = Number.parseInt(portRaw, 10);
    if (!Number.isFinite(port)) {
        throw new Error(`PORT must be a number, got: ${portRaw}`);
    }
    await app.listen(port);
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`🎬 Movies endpoint available at http://localhost:${port}/api/movies`);
}

bootstrap();
