import { Put, Get } from '@nestjs/common';
import { Body, Controller, Post, Delete } from '@nestjs/common';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('')
  async addTag(@Body() body) {
    const data = await this.tagService.getTag({ name: body.name });
    if (data) return { error: '标签名已存在' };
    return await this.tagService.addTag({ name: body.name, color: body.color });
  }

  @Delete('')
  async deleteTag(@Body() body) {
    return await this.tagService.deleteTag(body.id);
  }

  @Put('')
  async updateTag(@Body() body) {
    return await this.tagService.updateTag({
      id: body.id,
      name: body.name,
      color: body.color,
    });
  }

  @Get('')
  async getTagList() {
    return await this.tagService.getTagList();
  }
}
