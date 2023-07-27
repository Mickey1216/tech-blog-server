import { Put, Get } from '@nestjs/common';
import { Body, Controller, Post, Delete } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // 增加标签（标签名唯一，所以在增加之前，一定要先查看该标签名是否已经存在）
  @Post('')
  async addTag(@Body() body) {
    const tag = await this.tagService.getTag({ name: body.name });
    if (tag) return { error: '标签名已存在' };

    return await this.tagService.addTag({ name: body.name, color: body.color });
  }

  // 删除标签（根据标签id进行删除）
  @Delete('')
  async deleteTag(@Body() body) {
    return await this.tagService.deleteTag(body.id);
  }

  // 修改标签
  @Put('')
  async updateTag(@Body() body) {
    return await this.tagService.updateTag({
      id: body.id,
      name: body.name,
      color: body.color
    });
  }

  // 查询标签
  @Get('')
  async getTagList() {
    return await this.tagService.getTagList();
  }
}
