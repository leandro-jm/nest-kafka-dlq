import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Example of Dead Latter Qeue using KafkaJS and Nest';
  }
}
