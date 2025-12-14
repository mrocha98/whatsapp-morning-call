import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappControllerV1 } from './whatsapp.controller';
import { QRCodeModule } from 'src/qr-code/qr-code.module';

@Module({
  imports: [QRCodeModule],
  exports: [WhatsappService],
  providers: [WhatsappService],
  controllers: [WhatsappControllerV1],
})
export class WhatsappModule {}
