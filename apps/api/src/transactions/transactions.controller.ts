import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  TransactionsService,
  CreateTransactionDto,
  QueryTransactionsDto,
} from './transactions.service';

@ApiTags('💳 Transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách giao dịch (có filter & phân trang)' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.transactionsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết giao dịch' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transactionsService.findOne(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm giao dịch mới' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật giao dịch' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateTransactionDto>,
  ) {
    return this.transactionsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giao dịch (và hoàn lại số dư ví)' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.transactionsService.remove(userId, id);
  }
}
