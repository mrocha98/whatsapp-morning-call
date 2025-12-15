import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { QRCodeService } from 'src/qr-code/qr-code.service';
import {
  Client,
  Message,
  MessageContent,
  MessageSendOptions,
  RemoteAuth,
  Store,
} from 'whatsapp-web.js';
import { User } from './schemas';
import { MongoStore } from 'wwebjs-mongo';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly qrCodeService: QRCodeService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private static _client: Client | null = null;

  async initialize(): Promise<void> {
    if (WhatsappService._client !== null) {
      this.logger.log('Whatsapp Client already initialized');
      return;
    }
    this.logger.log('Initializing Whatsapp Client...');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const mongoStore = new MongoStore({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      mongoose: {
        connection: this.connection,
        Schema: this.connection.base.Schema,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        model: this.connection.model.bind(this.connection),
        Promise: Promise,
        mongo: mongoose.mongo,
      } as any,
    }) as Store;

    WhatsappService._client = new Client({
      authStrategy: new RemoteAuth({
        store: mongoStore,
        backupSyncIntervalMs: 300000,
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
        if (message.body === '/start') {
          await this.handleStartCommand(message);
        }
        if (message.body === '/help') {
          await this.handleHelpCommand(message);
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

  private async handleStartCommand(message: Message) {
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

  private async handleHelpCommand(message: Message) {
    await message.reply(
      'Envie */start* para começar a receber seus alertas diários. Caso já tenha enviado é só aguardar 😉',
    );
  }
}
