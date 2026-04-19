import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BudgetPeriod } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() @IsOptional() categoryId?: string;
  @ApiProperty({ example: 3000000 })
  @IsNumber()
  @Type(() => Number)
  amount: number;
  @ApiProperty({ enum: BudgetPeriod, default: 'MONTHLY' })
  @IsEnum(BudgetPeriod)
  @IsOptional()
  period?: BudgetPeriod;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiProperty({ example: 80 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  alertAt?: number;
  @ApiProperty({ example: '#f59e0b' }) @IsString() @IsOptional() color?: string;
}

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return budgets.map((b) => ({
      ...b,
      percentage:
        Number(b.amount) > 0
          ? Math.round((Number(b.spent) / Number(b.amount)) * 100)
          : 0,
      remaining: Number(b.amount) - Number(b.spent),
      isOverspent: Number(b.spent) > Number(b.amount),
      isWarning: (Number(b.spent) / Number(b.amount)) * 100 >= b.alertAt,
    }));
  }

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        userId,
        name: dto.name,
        categoryId: dto.categoryId,
        amount: dto.amount,
        period: dto.period || 'MONTHLY',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        alertAt: dto.alertAt || 80,
        color: dto.color || '#f59e0b',
      },
      include: { category: true },
    });
  }

  async update(userId: string, id: string, dto: Partial<CreateBudgetDto>) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new NotFoundException();
    if (budget.userId !== userId) throw new ForbiddenException();
    return this.prisma.budget.update({
      where: { id },
      data: {
        name: dto.name,
        amount: dto.amount,
        alertAt: dto.alertAt,
        color: dto.color,
      },
    });
  }

  async remove(userId: string, id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget || budget.userId !== userId) throw new ForbiddenException();
    return this.prisma.budget.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
