import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHealth() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }
}
