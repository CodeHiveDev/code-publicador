import { Test, TestingModule } from '@nestjs/testing';
import { RasterService } from './raster.service';

describe('RasterService', () => {
  let service: RasterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RasterService],
    }).compile();

    service = module.get<RasterService>(RasterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
