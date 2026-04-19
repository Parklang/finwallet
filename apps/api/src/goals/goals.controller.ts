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
  GoalsService,
  CreateGoalDto,
  ContributeGoalDto,
} from './goals.service';

@ApiTags('🎯 Goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả mục tiêu tiết kiệm' })
  findAll(@CurrentUser('id') userId: string) {
    return this.goalsService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mục tiêu mới' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(userId, dto);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Nạp tiền vào mục tiêu' })
  contribute(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ContributeGoalDto,
  ) {
    return this.goalsService.contribute(userId, id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật mục tiêu' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateGoalDto>,
  ) {
    return this.goalsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy mục tiêu' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.goalsService.remove(userId, id);
  }
}
