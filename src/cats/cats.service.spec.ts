import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';

describe('CatsService', () => {
  let service: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatsService],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a cat', () => {
    const cat = { name: 'テスト猫', age: 1, breed: 'テスト種' };
    service.create(cat);
    const cats = service.findAll();
    expect(cats).toContain(cat);
  });

  it('should find a cat by name', () => {
    const cat = { name: 'テスト猫2', age: 2, breed: 'テスト種2' };
    service.create(cat);
    const found = service.findOne('テスト猫2');
    expect(found).toEqual(cat);
  });
});
