import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappControllerV1 } from './whatsapp.controller';
import { QRCodeModule } from 'src/qr-code/qr-code.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    QRCodeModule,
  ],
  exports: [WhatsappService],
  providers: [WhatsappService],
  controllers: [WhatsappControllerV1],
})
export class WhatsappModule {}
