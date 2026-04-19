import { Module } from '@nestjs/common';
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CreateBillSplitDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsNumber() @Type(() => Number) totalAmount: number;
  @ApiProperty() @IsOptional() @IsString() note?: string;
  @ApiProperty({ type: Array }) @IsArray() participants: {
    name: string;
    email?: string;
    amount: number;
  }[];
}

@Injectable()
class BillSplitService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.billSplitSession.findMany({
      where: { userId },
      include: { participants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateBillSplitDto) {
    return this.prisma.billSplitSession.create({
      data: {
        userId,
        title: dto.title,
        totalAmount: dto.totalAmount,
        note: dto.note,
        participants: {
          create: dto.participants.map((p) => ({
            name: p.name,
            email: p.email,
            amount: p.amount,
          })),
        },
      },
      include: { participants: true },
    });
  }

  async markPaid(sessionId: string, participantId: string) {
    return this.prisma.billParticipant.update({
      where: { id: participantId },
      data: { isPaid: true, paidAt: new Date() },
    });
  }
}

@ApiTags('🤝 Bill Split')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('bill-split')
class BillSplitController {
  constructor(private service: BillSplitService) {}
  @Get() findAll(@CurrentUser('id') userId: string) {
    return this.service.findAll(userId);
  }
  @Post() create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBillSplitDto,
  ) {
    return this.service.create(userId, dto);
  }
  @Post(':id/paid/:participantId') markPaid(
    @Param('id') id: string,
    @Param('participantId') pid: string,
  ) {
    return this.service.markPaid(id, pid);
  }
}

@Module({ controllers: [BillSplitController], providers: [BillSplitService] })
export class BillSplitModule {}
