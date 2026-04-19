// ============================================================
// TRANSACTIONS SERVICE — Section 9: Core Ledger Module
// Double-Entry Bookkeeping + ACID Compliance via Prisma $transaction
// ============================================================
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;
  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Type(() => Number)
  amount: number;
  @ApiProperty() @IsString() @IsOptional() fromWalletId?: string;
  @ApiProperty() @IsString() @IsOptional() toWalletId?: string;
  @ApiProperty() @IsString() @IsOptional() categoryId?: string;
  @ApiProperty({ example: 'Cà phê Starbucks' })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty() @IsString() @IsOptional() note?: string;
  @ApiProperty() @IsString() @IsOptional() date?: string;
  @ApiProperty() @IsArray() @IsOptional() tags?: string[];
  @ApiProperty() @IsString() @IsOptional() location?: string;
  @ApiProperty() @IsString() @IsOptional() receiptImageUrl?: string;
  @ApiProperty() @IsBoolean() @IsOptional() isRecurring?: boolean;
}

export class QueryTransactionsDto {
  @IsString() @IsOptional() walletId?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsEnum(TransactionType) @IsOptional() type?: TransactionType;
  @IsDateString() @IsOptional() startDate?: string;
  @IsDateString() @IsOptional() endDate?: string;
  @IsString() @IsOptional() search?: string;
  @IsNumber() @IsOptional() @Type(() => Number) page?: number = 1;
  @IsNumber() @IsOptional() @Type(() => Number) limit?: number = 20;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryTransactionsDto) {
    const {
      walletId,
      categoryId,
      type,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(walletId && {
        OR: [{ fromWalletId: walletId }, { toWalletId: walletId }],
      }),
      ...(search && { description: { contains: search, mode: 'insensitive' } }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { category: true, fromWallet: true, toWallet: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, id: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: { category: true, fromWallet: true, toWallet: true },
    });
    if (!tx) throw new NotFoundException('Giao dịch không tồn tại');
    if (tx.userId !== userId) throw new ForbiddenException();
    return tx;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const amount = dto.amount;

    return this.prisma.$transaction(async (tx) => {
      // Validate wallets belong to user
      if (dto.type === 'EXPENSE' && !dto.fromWalletId)
        throw new BadRequestException('Vui lòng chọn ví để chi tiêu');
      if (dto.type === 'INCOME' && !dto.toWalletId)
        throw new BadRequestException('Vui lòng chọn ví để nhận tiền');
      if (dto.type === 'TRANSFER' && (!dto.fromWalletId || !dto.toWalletId))
        throw new BadRequestException('Vui lòng chọn ví nguồn và ví đích');

      // Update wallet balances (Double-entry logic)
      if (dto.fromWalletId) {
        const fromWallet = await tx.wallet.findUnique({
          where: { id: dto.fromWalletId },
        });
        if (!fromWallet || fromWallet.userId !== userId)
          throw new ForbiddenException('Ví không hợp lệ');
        await tx.wallet.update({
          where: { id: dto.fromWalletId },
          data: { balance: { decrement: amount } },
        });
      }

      if (dto.toWalletId) {
        const toWallet = await tx.wallet.findUnique({
          where: { id: dto.toWalletId },
        });
        if (!toWallet || toWallet.userId !== userId)
          throw new ForbiddenException('Ví không hợp lệ');
        await tx.wallet.update({
          where: { id: dto.toWalletId },
          data: { balance: { increment: amount } },
        });
      }

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: dto.type,
          amount,
          fromWalletId: dto.fromWalletId,
          toWalletId: dto.toWalletId,
          categoryId: dto.categoryId,
          description: dto.description,
          note: dto.note,
          date: dto.date ? new Date(dto.date) : new Date(),
          tags: dto.tags || [],
          location: dto.location,
          receiptImageUrl: dto.receiptImageUrl,
          isRecurring: dto.isRecurring || false,
        },
        include: { category: true, fromWallet: true, toWallet: true },
      });

      // Update budget spending if this is an expense
      if (dto.type === 'EXPENSE' && dto.categoryId) {
        await tx.budget.updateMany({
          where: {
            userId,
            categoryId: dto.categoryId,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          data: { spent: { increment: amount } },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE',
          entity: 'TRANSACTION',
          entityId: transaction.id,
          newData: { type: dto.type, amount, description: dto.description },
        },
      });

      return transaction;
    });
  }

  async update(userId: string, id: string, dto: Partial<CreateTransactionDto>) {
    await this.findOne(userId, id);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        description: dto.description,
        note: dto.note,
        categoryId: dto.categoryId,
        tags: dto.tags,
        location: dto.location,
        receiptImageUrl: dto.receiptImageUrl,
      },
      include: { category: true, fromWallet: true, toWallet: true },
    });
  }

  async remove(userId: string, id: string) {
    const tx = await this.findOne(userId, id);

    // Reverse the balance changes
    return this.prisma.$transaction(async (prisma) => {
      if (tx.fromWalletId) {
        await prisma.wallet.update({
          where: { id: tx.fromWalletId },
          data: { balance: { increment: Number(tx.amount) } },
        });
      }
      if (tx.toWalletId) {
        await prisma.wallet.update({
          where: { id: tx.toWalletId },
          data: { balance: { decrement: Number(tx.amount) } },
        });
      }
      await prisma.transaction.delete({ where: { id } });
      return { message: 'Đã xóa giao dịch' };
    });
  }
}
