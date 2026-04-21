// ============================================================
// PAYMENT CONTROLLER — VietQR API Endpoints
// ============================================================
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';

class GenerateVietQRDto {
  @ApiProperty({ example: 'MB', description: 'Mã ngân hàng (VCB, MB, ACB, TCB, ...)' })
  @IsString()
  bankId: string;

  @ApiProperty({ example: '0123456789', description: 'Số tài khoản người nhận' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 150000, description: 'Số tiền (VND)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  amount?: number;

  @ApiProperty({ example: 'Thanh toan bua an', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'NGUYEN VAN A', required: false })
  @IsOptional()
  @IsString()
  accountName?: string;
}

@ApiTags('💳 Payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('vietqr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tạo mã QR VietQR để nhận tiền',
    description: 'Tạo URL ảnh QR code theo chuẩn VietQR. Hỗ trợ tất cả ngân hàng trong liên minh VietQR.',
  })
  generateVietQR(@Body() dto: GenerateVietQRDto) {
    return this.paymentService.generateVietQRUrl(dto);
  }

  @Get('banks')
  @ApiOperation({ summary: 'Danh sách ngân hàng hỗ trợ VietQR' })
  getSupportedBanks() {
    return this.paymentService.getSupportedBanks();
  }
}
