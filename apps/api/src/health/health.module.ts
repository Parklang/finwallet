import { Module } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'FinWallet API',
    };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
