import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { QRCodeService } from 'src/qr-code/qr-code.service';
import {
  Client,
  LocalAuth,
  Message,
  MessageContent,
  MessageSendOptions,
  // RemoteAuth,
  // Store,
} from 'whatsapp-web.js';
// import { MongoStore } from 'wwebjs-mongo';

@Injectable()
export class WhatsappService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly qrCodeService: QRCodeService,
  ) {}

  private static _client: Client | null = null;

  async initialize(): Promise<void> {
    if (WhatsappService._client !== null) {
      return;
    }

    // const store = new MongoStore({ mongoose: this.connection.base }) as Store;

    WhatsappService._client = new Client({
      // authStrategy: new RemoteAuth({
      //   store,
      //   backupSyncIntervalMs: 300000,
      // }),
      authStrategy: new LocalAuth({
        dataPath: 'wwebjs-local',
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    })
      .on('ready', () => {
        console.info('Whatsapp Client is ready!');
      })
      .on('qr', (qr) => {
        this.qrCodeService.generate(qr);
      })
      .on('message_create', (message) => {
        if (message.fromMe) {
          return;
        }
        console.log(`------ ID ------`);
        console.log(`_serialized: ${message.id._serialized}`);
        console.log(`id: ${message.id.id}`);
        console.log(`remote: ${message.id.remote}`);
        console.log(`----------------`);
        if (message.body === '/start') {
          console.log(`/start recebido`);
          // TODO : salvar "id" e usuário no banco, tb ver se tem como salvar contato (https://github.com/pedroslopez/whatsapp-web.js/issues/532)
        }
        if (message.body === '/help') {
          console.log(`/help recebido`);
          // TODO : implementar envio de mensagem explicando o bot
        }
      });

    await WhatsappService._client.initialize();
  }

  async sendMessage(
    chatId: string,
    content: MessageContent,
    options?: MessageSendOptions,
  ): Promise<Message> {
    return await WhatsappService._client.sendMessage(chatId, content, options);
  }
}
