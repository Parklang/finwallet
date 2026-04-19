import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '@prisma/client';
import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: CategoryType }) @IsEnum(CategoryType) type: CategoryType;
  @ApiProperty() @IsString() @IsOptional() icon?: string;
  @ApiProperty() @IsString() @IsOptional() color?: string;
  @ApiProperty() @IsString() @IsOptional() parentId?: string;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      include: { children: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        icon: dto.icon || 'circle',
        color: dto.color || '#6366f1',
        parentId: dto.parentId,
      },
    });
  }

  async remove(userId: string, id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat || cat.userId !== userId)
      throw new Error('Không có quyền xóa danh mục này');
    return this.prisma.category.delete({ where: { id } });
  }
}
