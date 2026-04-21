// ============================================================
// PAYMENT SERVICE — Thanh toán VietQR & PayOS
// Section 8: Integrations
// ============================================================
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Template VietQR static URL (không cần SDK)
const VIETQR_BASE = 'https://img.vietqr.io/image';

export interface VietQRParams {
  bankId: string;          // Mã ngân hàng VietQR (ACB, VCB, TCB, MB, ...)
  accountNumber: string;   // Số tài khoản người nhận
  amount?: number;         // Số tiền (tùy chọn)
  description?: string;    // Nội dung chuyển khoản
  accountName?: string;    // Tên chủ tài khoản
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private configService: ConfigService) {}

  // === VietQR Static — Tạo URL ảnh QR code ==================
  generateVietQRUrl(params: VietQRParams): {
    qrUrl: string;
    qrDataUrl: string;
    bankInfo: VietQRParams;
  } {
    const { bankId, accountNumber, amount, description, accountName } = params;

    // VietQR image API: https://img.vietqr.io/image/{bankId}-{accountNumber}-{template}.png
    // Template: compact2 (có logo ngân hàng + thông tin)
    const template = 'compact2';
    let qrUrl = `${VIETQR_BASE}/${bankId}-${accountNumber}-${template}.png`;

    const queryParams = new URLSearchParams();
    if (amount) queryParams.append('amount', amount.toString());
    if (description) queryParams.append('addInfo', description);
    if (accountName) queryParams.append('accountName', accountName);

    const queryString = queryParams.toString();
    if (queryString) qrUrl += `?${queryString}`;

    return {
      qrUrl,
      qrDataUrl: qrUrl, // Ảnh QR trực tiếp từ VietQR
      bankInfo: params,
    };
  }

  // === VietQR Dynamic — Tạo EMVCo QR string =================
  generateVietQRString(params: VietQRParams): string {
    // Chuẩn EMVCo VietQR (simplified)
    // Trong production đầy đủ sẽ dùng @vietqr/vietqr npm package
    const { bankId, accountNumber, amount, description } = params;

    // Mapping bank ID → VietQR NAPAS code
    const bankCodes: Record<string, string> = {
      vcb: '970436', mb: '970422', acb: '970416', tcb: '970407',
      bidv: '970418', agribank: '970405', vietinbank: '970415',
      sacombank: '970403', vpbank: '970432', tpbank: '970423',
      momo: '970426', zalopay: '970454',
    };

    const napasCode = bankCodes[bankId.toLowerCase()] || bankId;
    const amt = amount ? amount.toString() : '';
    const desc = description || 'Chuyen tien FinWallet';

    // Format EMVCo tag-length-value (simplified)
    return `00020101021238${napasCode.length + accountNumber.length + 20}...${napasCode}${accountNumber}${amt ? '54' + amt.length.toString().padStart(2, '0') + amt : ''}5303704${desc ? '62' + (desc.length + 4).toString().padStart(2, '0') + '08' + desc.length.toString().padStart(2, '0') + desc : ''}6304`;
  }

  // === Danh sách ngân hàng hỗ trợ VietQR ===================
  getSupportedBanks(): Array<{ id: string; name: string; shortName: string; logo?: string }> {
    return [
      { id: 'VCB',  name: 'Vietcombank',              shortName: 'VCB'  },
      { id: 'MB',   name: 'MB Bank',                  shortName: 'MB'   },
      { id: 'ACB',  name: 'Asia Commercial Bank',     shortName: 'ACB'  },
      { id: 'TCB',  name: 'Techcombank',              shortName: 'TCB'  },
      { id: 'BIDV', name: 'BIDV',                     shortName: 'BIDV' },
      { id: 'VPB',  name: 'VPBank',                   shortName: 'VPB'  },
      { id: 'TPB',  name: 'TPBank',                   shortName: 'TPB'  },
      { id: 'STB',  name: 'Sacombank',                shortName: 'STB'  },
      { id: 'VIB',  name: 'Vietnam International Bank', shortName: 'VIB' },
      { id: 'MSB',  name: 'Maritime Bank',            shortName: 'MSB'  },
      { id: 'MOMO', name: 'MoMo E-Wallet',            shortName: 'MOMO' },
    ];
  }
}
