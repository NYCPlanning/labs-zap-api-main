import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthService } from './auth/auth.service';
import { ContactService } from './contact/contact.service';
import { AppController } from './app.controller';
import { ConfigService } from './config/config.service';

describe('App Controller', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          // how you provide the injection token in a test instance
          useValue: new (class Mock { }),
        },
        {
          provide: ContactService,
          // how you provide the injection token in a test instance
          useValue: new (class Mock { }),
        },
        {
          provide: ConfigService,
          // how you provide the injection token in a test instance
          useValue: new (class Mock {
            get() {}
          }),
        },
      ],
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
