import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { WhatsappService } from './whatsapp/whatsapp.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('env MONGODB_URI is not defined');
        }
        return { uri };
      },
    }),
    WhatsappModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly whatsappService: WhatsappService) {}

  async onApplicationBootstrap() {
    await this.whatsappService.initialize();
  }
}
