import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type WebhookWhatsappAlertsActivationBody = {
  phoneNumber: string;
  active: boolean;
};

@Injectable()
export class VoompApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  webhookWhatsappAlertsActivation(body: WebhookWhatsappAlertsActivationBody) {
    const apiUrl = this.configService.get<string>('VOOMP_API');
    return this.httpService.patch<null, WebhookWhatsappAlertsActivationBody>(
      `${apiUrl}/api/v1/webhooks/whatsapp-alerts-activation`,
      body,
    );
  }
}
