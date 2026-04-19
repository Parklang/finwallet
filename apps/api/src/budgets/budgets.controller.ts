import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BudgetsService, CreateBudgetDto } from './budgets.service';

@ApiTags('📊 Budgets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả ngân sách' })
  findAll(@CurrentUser('id') userId: string) {
    return this.budgetsService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo ngân sách mới' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật ngân sách' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateBudgetDto>,
  ) {
    return this.budgetsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ngân sách' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.budgetsService.remove(userId, id);
  }
}
