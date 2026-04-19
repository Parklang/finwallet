import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
