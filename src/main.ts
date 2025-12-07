import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // cho Postman gọi được
  await app.listen(3000);
  console.log('CampusHub API đang chạy tại: http://localhost:3000');
}
bootstrap();