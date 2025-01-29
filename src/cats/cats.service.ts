import { Injectable, NotFoundException } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }

  findOne(name: string): Cat {
    const cat = this.cats.find((cat) => cat.name === name);
    if (!cat) {
      throw new NotFoundException(`Cat ${name} not found`);
    }
    return cat;
  }
}
