import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('message')
  getMessage() {
    return this.appService.getMessage();
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}

