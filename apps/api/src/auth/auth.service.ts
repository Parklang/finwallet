// ============================================================
// AUTH SERVICE — Section 5: Authentication & Security
// ============================================================
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(this.configService.get('BCRYPT_ROUNDS') || '12');
    return bcrypt.hash(password, rounds);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES') || '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email đã được sử dụng');

    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    // Create default wallet & categories for new user
    await this.createDefaultDataForUser(user.id);

    const tokens = await this.generateTokens(user.id, user.email);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entity: 'USER',
        entityId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        currency: user.currency,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.refreshToken) throw new UnauthorizedException('Access Denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    await this.prisma.auditLog.create({
      data: { userId, action: 'LOGOUT', entity: 'USER', entityId: userId },
    });
    return { message: 'Đăng xuất thành công' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user?.password || '',
    );
    if (!isValid) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    const hashedNew = await this.hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNew, refreshToken: null },
    });
    return { message: 'Đổi mật khẩu thành công' };
  }

  // Đăng nhập / Đăng ký qua Google OAuth
  async loginWithGoogle(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    googleId: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Tự động tạo tài khoản mới khi lần đầu OAuth
      const randomPassword = await this.hashPassword(
        Math.random().toString(36).slice(-12) + 'Aa1!',
      );
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          avatar: googleUser.avatar,
          password: randomPassword,
          isVerified: true, // OAuth users đã xác minh email
        },
      });
      await this.createDefaultDataForUser(user.id);
    } else if (!user.isVerified) {
      // Cập nhật trạng thái verified nếu login lần đầu qua Google
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, avatar: googleUser.avatar || user.avatar },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    await this.prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', entity: 'USER', entityId: user.id },
    });

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      ...tokens,
    };
  }

  private async createDefaultDataForUser(userId: string) {
    // Default wallet
    await this.prisma.wallet.create({
      data: {
        userId,
        name: 'Tiền mặt',
        type: 'CASH',
        isDefault: true,
        color: '#10b981',
        icon: 'banknotes',
      },
    });

    // Default categories
    const defaultCategories = [
      // Expense
      {
        name: 'Ăn uống',
        type: 'EXPENSE' as const,
        icon: 'utensils',
        color: '#f59e0b',
      },
      {
        name: 'Đi lại',
        type: 'EXPENSE' as const,
        icon: 'car',
        color: '#3b82f6',
      },
      {
        name: 'Mua sắm',
        type: 'EXPENSE' as const,
        icon: 'shopping-cart',
        color: '#ec4899',
      },
      {
        name: 'Giải trí',
        type: 'EXPENSE' as const,
        icon: 'tv',
        color: '#8b5cf6',
      },
      {
        name: 'Sức khỏe',
        type: 'EXPENSE' as const,
        icon: 'hospital',
        color: '#ef4444',
      },
      {
        name: 'Giáo dục',
        type: 'EXPENSE' as const,
        icon: 'book',
        color: '#06b6d4',
      },
      {
        name: 'Hóa đơn',
        type: 'EXPENSE' as const,
        icon: 'file-text',
        color: '#64748b',
      },
      {
        name: 'Khác',
        type: 'EXPENSE' as const,
        icon: 'more-horizontal',
        color: '#94a3b8',
      },
      // Income
      {
        name: 'Lương',
        type: 'INCOME' as const,
        icon: 'dollar-sign',
        color: '#10b981',
      },
      {
        name: 'Đầu tư',
        type: 'INCOME' as const,
        icon: 'trending-up',
        color: '#22c55e',
      },
      {
        name: 'Thưởng',
        type: 'INCOME' as const,
        icon: 'gift',
        color: '#a3e635',
      },
      {
        name: 'Freelance',
        type: 'INCOME' as const,
        icon: 'briefcase',
        color: '#84cc16',
      },
    ];

    await this.prisma.category.createMany({
      data: defaultCategories.map((c) => ({ ...c, userId })),
    });
  }
}
