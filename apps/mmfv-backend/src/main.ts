import { NestFactory } from '@nestjs/core';
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

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`🎬 Movies endpoint available at http://localhost:${port}/api/movies`);
}

bootstrap();
