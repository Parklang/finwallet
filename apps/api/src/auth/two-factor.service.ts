// ============================================================
// TWO FACTOR SERVICE — Section 5: Security (2FA via Email OTP)
// ============================================================
import {
  Injectable,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 phút

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  // Tạo OTP 6 số ngẫu nhiên
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Gửi OTP qua Email
  async sendOTP(userId: string): Promise<{ message: string; expiresIn: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, twoFactorEnabled: true },
    });
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + this.OTP_TTL_MS);

    // Lưu OTP vào DB (dùng twoFactorSecret tạm thời, có TTL)
    // Format: "OTP:expiresAt.toISOString()"
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: `${otp}:${expiresAt.toISOString()}` },
    });

    // Gửi email
    await this.sendOTPEmail(user.email, user.firstName, otp);

    this.logger.log(`OTP đã gửi cho user ${userId}`);
    return {
      message: `Mã OTP đã được gửi đến ${user.email}`,
      expiresIn: 300, // giây
    };
  }

  // Xác minh OTP
  async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      throw new BadRequestException('Chưa có OTP. Hãy gởi OTP trước.');
    }

    const [storedOtp, expiresAtStr] = user.twoFactorSecret.split(':');
    const expiresAt = new Date(expiresAtStr);

    if (Date.now() > expiresAt.getTime()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: null },
      });
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
    }

    if (storedOtp !== otp) {
      throw new UnauthorizedException('Mã OTP không đúng.');
    }

    // Xóa OTP sau khi verify thành công
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: null },
    });

    return true;
  }

  // Bật/tắt 2FA
  async toggle2FA(userId: string, enable: boolean): Promise<{ message: string; twoFactorEnabled: boolean }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: enable },
    });
    return {
      message: enable ? 'Đã bật xác thực 2 lớp' : 'Đã tắt xác thực 2 lớp',
      twoFactorEnabled: enable,
    };
  }

  // Kiểm tra user có bật 2FA không
  async isEnabled(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });
    return user?.twoFactorEnabled ?? false;
  }

  // Gửi email OTP với nodemailer
  private async sendOTPEmail(email: string, firstName: string, otp: string) {
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');
    const smtpFrom = this.configService.get('SMTP_FROM') || 'FinWallet <noreply@finwallet.app>';

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP chưa được cấu hình — Bỏ qua gửi email');
      this.logger.debug(`[DEV MODE] OTP cho ${email}: ${otp}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563EB, #1D4ED8); padding: 32px 32px 24px; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 8px;">💳</div>
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">FinWallet</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Xác thực bảo mật 2 lớp</p>
    </div>
    <!-- Body -->
    <div style="padding: 32px;">
      <p style="color: #334155; font-size: 15px; margin: 0 0 16px;">Xin chào <strong>${firstName}</strong>,</p>
      <p style="color: #64748b; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
        Mã xác thực OTP của bạn là:
      </p>
      <!-- OTP Box -->
      <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 2px dashed #e2e8f0;">
        <div style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #2563EB; font-family: monospace;">${otp}</div>
      </div>
      <p style="color: #ef4444; font-size: 13px; margin: 0 0 16px; text-align: center;">
        ⏱️ Mã này hết hạn sau <strong>5 phút</strong>
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.6;">
        Nếu bạn không yêu cầu mã này, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.
      </p>
    </div>
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2025 FinWallet. Không chia sẻ mã OTP với bất kỳ ai.</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: `[FinWallet] Mã xác thực OTP: ${otp}`,
      html,
    });

    this.logger.log(`Email OTP đã gửi đến ${email}`);
  }
}
