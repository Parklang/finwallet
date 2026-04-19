// ============================================================
// GOALS SERVICE — Section 9: Saving Goals (Hũ tài chính)
// ============================================================
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGoalDto {
  @ApiProperty({ example: 'Mua MacBook Pro' }) @IsString() name: string;
  @ApiProperty({ example: 40000000 })
  @IsNumber()
  @Type(() => Number)
  targetAmount: number;
  @ApiProperty() @IsDateString() @IsOptional() deadline?: string;
  @ApiProperty({ example: '💻' }) @IsString() @IsOptional() icon?: string;
  @ApiProperty({ example: '#6366f1' }) @IsString() @IsOptional() color?: string;
  @ApiProperty() @IsString() @IsOptional() description?: string;
}

export class ContributeGoalDto {
  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Type(() => Number)
  amount: number;
}

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const goals = await this.prisma.savingGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((g) => ({
      ...g,
      percentage:
        Number(g.targetAmount) > 0
          ? Math.min(
              Math.round(
                (Number(g.currentAmount) / Number(g.targetAmount)) * 100,
              ),
              100,
            )
          : 0,
      remaining: Math.max(Number(g.targetAmount) - Number(g.currentAmount), 0),
      isCompleted: Number(g.currentAmount) >= Number(g.targetAmount),
    }));
  }

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.savingGoal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: dto.targetAmount,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        icon: dto.icon || 'target',
        color: dto.color || '#10b981',
        description: dto.description,
      },
    });
  }

  async contribute(userId: string, goalId: string, dto: ContributeGoalDto) {
    const goal = await this.prisma.savingGoal.findUnique({
      where: { id: goalId },
    });
    if (!goal) throw new NotFoundException();
    if (goal.userId !== userId) throw new ForbiddenException();

    const newAmount = Number(goal.currentAmount) + dto.amount;
    const isCompleted = newAmount >= Number(goal.targetAmount);

    const updated = await this.prisma.savingGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: newAmount,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      },
    });

    if (isCompleted) {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'GOAL_ACHIEVED',
          title: '🎉 Mục tiêu hoàn thành!',
          message: `Chúc mừng! Bạn đã đạt được mục tiêu "${goal.name}"`,
          data: { goalId },
        },
      });
    }

    return updated;
  }

  async update(userId: string, id: string, dto: Partial<CreateGoalDto>) {
    const goal = await this.prisma.savingGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) throw new ForbiddenException();
    return this.prisma.savingGoal.update({
      where: { id },
      data: {
        name: dto.name,
        targetAmount: dto.targetAmount,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        description: dto.description,
        icon: dto.icon,
        color: dto.color,
      },
    });
  }

  async remove(userId: string, id: string) {
    const goal = await this.prisma.savingGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) throw new ForbiddenException();
    return this.prisma.savingGoal.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
