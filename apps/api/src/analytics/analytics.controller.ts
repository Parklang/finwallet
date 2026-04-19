import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('📈 Analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard tổng quan tài chính' })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.analyticsService.getDashboard(userId);
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Biểu đồ cashflow theo năm' })
  @ApiQuery({ name: 'year', required: false })
  getCashflow(@CurrentUser('id') userId: string, @Query('year') year?: string) {
    return this.analyticsService.getCashflowChart(
      userId,
      parseInt(year || String(new Date().getFullYear())),
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Phân tích chi tiêu/thu nhập theo danh mục' })
  @ApiQuery({ name: 'type', enum: ['INCOME', 'EXPENSE'] })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  getCategoryBreakdown(
    @CurrentUser('id') userId: string,
    @Query('type') type: 'INCOME' | 'EXPENSE',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getCategoryBreakdown(
      userId,
      type || 'EXPENSE',
      startDate,
      endDate,
    );
  }

  @Get('net-worth')
  @ApiOperation({ summary: 'Tổng tài sản ròng' })
  getNetWorth(@CurrentUser('id') userId: string) {
    return this.analyticsService.getNetWorthTimeline(userId);
  }
}
