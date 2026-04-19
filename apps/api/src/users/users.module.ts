import { Module } from '@nestjs/common';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Injectable()
class UsersService {
  constructor(private prisma: PrismaService) {}
  async findMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        currency: true,
        language: true,
        timezone: true,
        createdAt: true,
      },
    });
  }
  async updateProfile(userId: string, data: Record<string, unknown>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        currency: true,
      },
    });
  }
}

@ApiTags('👤 Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('users')
class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('me') getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findMe(userId);
  }
}

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
