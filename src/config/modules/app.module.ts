import { Module } from '@nestjs/common';
import { AppController } from '../../endpoint/app.controller';
import { AppService } from '../../core/usecases/app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
