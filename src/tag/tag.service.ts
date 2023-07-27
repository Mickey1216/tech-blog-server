import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(@InjectRepository(Tag) private readonly tag: Repository<Tag>) {}

  // 增加标签
  addTag({ name, color }) {
    const tag = new Tag();
    tag.name = name;
    tag.color = color;
    return this.tag.save(tag);
  }

  // 删除标签
  deleteTag(id) {
    return this.tag.delete(id);
  }

  // 修改标签
  updateTag({ id, name, color }) {
    const tag = new Tag();
    tag.name = name;
    tag.color = color;
    return this.tag.update(id, tag);
  }

  // 根据标签名查找标签
  getTag(name) {
    return this.tag.findOne({
      where: name
    });
  }

  // 查找所有标签，根据创建时间升序排列
  getTagList() {
    return this.tag.find({
      order: {
        createTime: 'ASC'
      }
    });
  }
}
