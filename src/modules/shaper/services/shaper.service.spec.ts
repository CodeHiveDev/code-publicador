import { Test, TestingModule } from '@nestjs/testing';
import { ShaperService } from './shaper.service';

describe('ShaperService', () => {
  let service: ShaperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShaperService],
    }).compile();

    service = module.get<ShaperService>(ShaperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
