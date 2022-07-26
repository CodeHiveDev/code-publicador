import { Test, TestingModule } from '@nestjs/testing';
import { RasterController } from './raster.controller';

describe('RasterController', () => {
  let controller: RasterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RasterController],
    }).compile();

    controller = module.get<RasterController>(RasterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
