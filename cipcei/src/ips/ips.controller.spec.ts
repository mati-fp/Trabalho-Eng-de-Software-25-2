import { Test, TestingModule } from '@nestjs/testing';
import { IpsController } from './ips.controller';

describe('IpsController', () => {
  let controller: IpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpsController],
    }).compile();

    controller = module.get<IpsController>(IpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
