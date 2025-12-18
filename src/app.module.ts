import {
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { AuthModule } from './auth/auth.module';

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
    AuthModule,
    WhatsappModule,
  ],
})
export class AppModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  async onApplicationBootstrap() {
    await this.whatsappService.initialize();
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application received shutdown signal: ${signal}`);
    await this.whatsappService.close();
  }
}
