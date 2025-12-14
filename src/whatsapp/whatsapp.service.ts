import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QRCodeService } from 'src/qr-code/qr-code.service';
import {
  Client,
  LocalAuth,
  Message,
  MessageContent,
  MessageSendOptions,
} from 'whatsapp-web.js';
import { User } from './schemas';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly qrCodeService: QRCodeService,
  ) {}

  private static _client: Client | null = null;

  async initialize(): Promise<void> {
    if (WhatsappService._client !== null) {
      this.logger.log('Whatsapp Client already initialized');
      return;
    }
    this.logger.log('Initializing Whatsapp Client...');

    WhatsappService._client = new Client({
      authStrategy: new LocalAuth({
        dataPath: 'wwebjs-local',
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    })
      .on('ready', () => {
        this.logger.log('Whatsapp Client is ready!');
      })
      .on('qr', (qr) => {
        this.logger.log('QR Code generated, please scan');
        this.qrCodeService.generate(qr);
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('message_create', async (message) => {
        if (message.fromMe) {
          return;
        }
        // console.log(`------ ID ------`);
        // console.log(`_serialized: ${message.id._serialized}`);
        // console.log(`id: ${message.id.id}`);
        // console.log(`remote: ${message.id.remote}`);
        // console.log(`----------------`);

        if (message.body === '/start') {
          const { phone, whatsappId } =
            await this.extractPhoneNumberAndIdsFromMessage(message);
          const user = await this.userModel.exists({
            phoneNumber: phone.number,
          });
          const userAlreadyExists = !!user?._id;
          if (userAlreadyExists) {
            return;
          }

          await this.userModel.create({
            phoneNumber: phone.number,
            formattedPhoneNumber: phone.formatted,
            lid: whatsappId.lid,
            pn: whatsappId.pn,
          });

          await message.reply(
            '✅ Número cadastrado com sucesso! Você começará a receber os alertas diariamente 🚀',
          );
          // TODO : ver se tem como salvar contato (https://github.com/pedroslopez/whatsapp-web.js/issues/532)
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

  private async extractPhoneNumberAndIdsFromMessage(message: Message) {
    const [contactLidAndPhone] =
      await WhatsappService._client.getContactLidAndPhone([message.id.remote]);
    const formatted = await WhatsappService._client.getFormattedNumber(
      contactLidAndPhone.pn,
    );
    const phoneNumber = formatted.replaceAll(/\D/g, '');

    return {
      phone: { number: phoneNumber, formatted },
      whatsappId: contactLidAndPhone,
    };
  }

  async getUserFromPhoneNumber(phoneNumber: string) {
    return await this.userModel.findOne({ phoneNumber });
  }
}
