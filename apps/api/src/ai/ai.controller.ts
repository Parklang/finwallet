import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';

class ChatMessageDto {
  @ApiProperty({ example: 'Tháng này tôi chi nhiều nhất vào đâu?' })
  @IsString()
  message: string;
}

class CategorizeDto {
  @ApiProperty({ example: 'Grab Food order' })
  @IsString()
  description: string;
}

class ParseQrDto {
  @ApiProperty({
    example:
      '00020101021238580010A000000727012800069704070...53037045405500005802VN62180814Chuyen tien ATM6304E5F5',
  })
  @IsString()
  qrData: string;
}

@ApiTags('🤖 AI Features')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('parse-qr')
  @ApiOperation({ summary: 'Trích xuất thông tin chuyển khoản từ mã VietQR' })
  parseQr(@Body() dto: ParseQrDto) {
    return this.aiService.parseQR(dto.qrData);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat với AI Financial Advisor' })
  chat(@CurrentUser('id') userId: string, @Body() dto: ChatMessageDto) {
    return this.aiService
      .chat(userId, dto.message)
      .then((response) => ({ response }));
  }

  @Get('chat/history')
  @ApiOperation({ summary: 'Lấy lịch sử chat với AI' })
  getChatHistory(@CurrentUser('id') userId: string) {
    return this.aiService.getChatHistory(userId);
  }

  @Post('categorize')
  @ApiOperation({ summary: 'AI tự động phân loại giao dịch' })
  categorize(@CurrentUser('id') userId: string, @Body() dto: CategorizeDto) {
    return this.aiService.categorizeTransaction(dto.description, userId);
  }

  @Post('scan-receipt')
  @ApiOperation({ summary: 'Quét hóa đơn bằng AI (OCR)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async scanReceipt(@UploadedFile() file: Express.Multer.File) {
    const base64 = file.buffer.toString('base64');
    return this.aiService.scanReceipt(base64);
  }
}
