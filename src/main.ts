import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

declare const module: any;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:4200', 'http://localhost:3000'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [/\.planninglabs\.nyc$/, /\.planning\.nyc\.gov$/,'http://localhost:4200','http://localhost:3000'],
      credentials: true,
    },
  });

  app.use(compression());
  // app.use(cookieparser());
  app.use(bodyParser.json({
    type: 'application/vnd.api+json'
  }));

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
