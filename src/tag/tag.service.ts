import { Tag } from './entities/tag.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(@InjectRepository(Tag) private readonly tag: Repository<Tag>) {}

  addTag({ name, color }) {
    const data = new Tag();
    data.name = name;
    data.color = color;
    return this.tag.save(data);
  }

  deleteTag(id) {
    return this.tag.delete(id);
  }

  updateTag({ id, name, color }) {
    const data = new Tag();
    data.name = name;
    data.color = color;
    return this.tag.update(id, data);
  }

  getTag(where) {
    return this.tag.findOne({
      where,
    });
  }

  getTagList() {
    return this.tag.find({
      order: {
        createTime: 'ASC',
      },
    });
  }
}
