import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDTO } from './dtos';
import { ConfigService } from '@nestjs/config';
import { ApiBasicAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiBasicAuth()
@UseGuards(AuthGuard('basic'))
@Controller({ version: '1', path: '/whatsapp' })
export class WhatsappControllerV1 {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/message')
  async sendMessage(@Body() body: SendMessageDTO) {
    const user = await this.whatsappService.getUserFromPhoneNumber(
      body.phoneNumber,
    );
    if (!user?._id) {
      throw new BadRequestException('user must send /start');
    }
    const message = await this.whatsappService.sendMessage(user.lid, body.text);

    await this.whatsappService.saveSentMessageLog(message, body.phoneNumber);

    return { id: message.id.remote, phoneNumber: body.phoneNumber };
  }

  @Get('/start-url')
  getStartUrl() {
    const whatsappNumber = this.configService.get<string>('WHATSAPP_NUMBER');
    const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('/start')}`;

    return { link };
  }
}
