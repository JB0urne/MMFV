import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMessage() {
    return {
      message: 'Hello from NestJS backend!',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

