import { Controller, Post } from '@nestjs/common';

@Controller({ version: '1', path: '/whatsapp' })
export class WhatsappControllerV1 {
  @Post()
  sendMessage() {
    return 'hello world';
  }
}
