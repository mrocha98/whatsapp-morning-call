import { Injectable } from '@nestjs/common';
import qrcode from 'qrcode-terminal';

@Injectable()
export class QRCodeService {
  generate(qr: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    qrcode.generate(qr, { small: true });
  }
}
