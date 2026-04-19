// ============================================================
// WALLETS SERVICE — Section 9: Core Modules
// ============================================================
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
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WalletType } from '@prisma/client';

export class CreateWalletDto {
  @ApiProperty({ example: 'BIDV Visa' })
  @IsString()
  name: string;

  @ApiProperty({ enum: WalletType, default: WalletType.BANK_ACCOUNT })
  @IsEnum(WalletType)
  @IsOptional()
  type?: WalletType = WalletType.CASH;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  initialBalance?: number = 0;

  @ApiProperty({ example: 'VND' })
  @IsString()
  @IsOptional()
  currency?: string = 'VND';

  @ApiProperty({ example: '#3b82f6' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'credit-card' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty() @IsOptional() description?: string;
  @ApiProperty() @IsBoolean() @IsOptional() isDefault?: boolean;
}

export class UpdateWalletDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() color?: string;
  @IsString() @IsOptional() icon?: string;
  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isDefault?: boolean;
  @IsBoolean() @IsOptional() isArchived?: boolean;
}

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, isArchived: false },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    // Calculate net worth
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    return { wallets, totalBalance };
  }

  async findOne(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
    if (!wallet) throw new NotFoundException('Ví không tồn tại');
    if (wallet.userId !== userId) throw new ForbiddenException();
    return wallet;
  }

  async create(userId: string, dto: CreateWalletDto) {
    if (dto.isDefault) {
      await this.prisma.wallet.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.wallet.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type || 'CASH',
        balance: dto.initialBalance || 0,
        currency: dto.currency || 'VND',
        color: dto.color || '#6366f1',
        icon: dto.icon || 'wallet',
        description: dto.description,
        isDefault: dto.isDefault || false,
      },
    });
  }

  async update(userId: string, walletId: string, dto: UpdateWalletDto) {
    await this.findOne(userId, walletId);
    if (dto.isDefault) {
      await this.prisma.wallet.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.wallet.update({ where: { id: walletId }, data: dto });
  }

  async remove(userId: string, walletId: string) {
    const wallet = await this.findOne(userId, walletId);
    if (wallet.isDefault)
      throw new ForbiddenException('Không thể xóa ví mặc định');
    return this.prisma.wallet.update({
      where: { id: walletId },
      data: { isArchived: true },
    });
  }
}
