import { Test, TestingModule } from '@nestjs/testing';
import { ShapefilesService } from './shapefiles.service';

describe('ShapefilesService', () => {
  let service: ShapefilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShapefilesService],
    }).compile();

    service = module.get<ShapefilesService>(ShapefilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
