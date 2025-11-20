import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

@WebSocketGateway(8080, { cors: '*' })
export class AudioGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('audio')
  async handleAudio(client: any, data: ArrayBuffer): Promise<void> {
    try {
      const convertedAudioBuffer = Buffer.from(data);

      const filename = `${uuidv4()}.webm`;

      const writeStream = createWriteStream(`./uploads/${filename}`);

      writeStream.write(convertedAudioBuffer);
      writeStream.end();

      client.emit('audioStatus', {
        status: 'success',
        message: `Audio received and saved as ${filename}`,
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      client.emit('audioStatus', {
        status: 'error',
        message: 'Failed to process audio',
      });
    }
  }
}
