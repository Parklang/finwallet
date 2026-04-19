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
import {
  WalletsService,
  CreateWalletDto,
  UpdateWalletDto,
} from './wallets.service';

@ApiTags('👛 Wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả ví của người dùng' })
  findAll(@CurrentUser('id') userId: string) {
    return this.walletsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết 1 ví' })
  findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.walletsService.findOne(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo ví mới' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật ví' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ví (archive)' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.walletsService.remove(userId, id);
  }
}
