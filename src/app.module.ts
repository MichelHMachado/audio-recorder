import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioGateway } from './audio/audio.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AudioGateway],
})
export class AppModule {}
