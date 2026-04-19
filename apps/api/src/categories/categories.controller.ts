import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CategoriesService, CreateCategoryDto } from './categories.service';

@ApiTags('📂 Categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get() findAll(@CurrentUser('id') userId: string) {
    return this.categoriesService.findAll(userId);
  }
  @Post() create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(userId, dto);
  }
  @Delete(':id') remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.remove(userId, id);
  }
}
