import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { VoompApiService } from './voomp-api.service';

@Module({
  imports: [HttpModule],
  exports: [VoompApiService],
  providers: [VoompApiService],
})
export class VoompApiModule {}
