import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Query,
  Delete,
  Put,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/user/user.service';
import { Not, In } from 'typeorm';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly userService: UserService,
  ) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async addArticle(@UploadedFile() file, @Body() body) {
    const article = JSON.parse(body.article);
    if (article.content.length > 15360) return { error: '文章长度超出' };
    const data = await this.articleService.getArticle({
      title: article.title,
    });
    if (data) return { error: '存在相同标题的文章' };
    article.createTime = new Date(article.createTime);
    article.updateTime = new Date(article.updateTime);
    return this.articleService.addArticle({
      filename: file.filename,
      ...article,
    });
  }

  @Delete('')
  async deleteArticle(@Body() { id }) {
    return await this.articleService.deleteArticle(id);
  }

  @Put('')
  @UseInterceptors(FileInterceptor('file'))
  async updateArticle(@UploadedFile() file, @Body() body) {
    const article = JSON.parse(body.article);
    if (article.content.length > 15360) return { error: '文章长度超出' };
    const id = article.id;
    const data = await this.articleService.getArticle({
      title: article.title,
      id: Not(id),
    });
    if (data) return { error: '存在相同标题的文章' };
    if (!id) return { error: '没有id' };
    article.createTime = new Date(article.createTime);
    article.updateTime = new Date(article.updateTime);
    this.articleService.updateArticle(id, {
      ...article,
      filename: file?.filename || null,
    });
    return await this.articleService.getArticle({ id });
  }

  @Get(':id')
  async getArticle(@Param() { id }, @Req() { _id }) {
    const res = await this.articleService.getArticle({ id });
    if (!res) return { error: '数据加载错误，可能是无效的id' };
    if (!_id && !res.publicState) {
      return { error: '私有文章，无法查看' };
    }
    return res;
  }

  @Post('recommendList')
  async getArticleRecommendList(@Body() { recommendIdList, defaultData }) {
    if (!recommendIdList.length) {
      //未给推荐列表，取默认用户的推荐列表
      const user = await this.userService.getUser({});
      recommendIdList = user?.recommendIdList;
    }
    let res = await this.articleService.getArticleList({
      id: In(recommendIdList || []),
    });
    if (res.length) {
      //有推荐列表数据
      res.forEach((item) => {
        item.sortValue = recommendIdList.indexOf(item.id);
      });
      res = res.sort((a, b) => a.sortValue - b.sortValue);
      return res;
    }
    if (!defaultData) return []; //false不给
    //配置项，为true时给予最近的文章作为推荐列表数据
    return this.articleService.searchArticleList({
      kw: '',
      order: 'DESC',
      skip: 0,
      take: 10,
      orderType: 'createTime',
      filterType: '1,1,1,1',
    });
  }

  @Get('')
  async searchArticle(@Query() query) {
    const defaultQuery = {
      kw: '',
      order: 'DESC',
      skip: 0,
      take: 20,
      orderType: 'createTime',
      filterType: '1,1,1,1',
    };
    const finalQuery = getSearchQuery(defaultQuery, query);

    const count = await this.articleService.searchArticleListCount(finalQuery);
    if (count === 0) return { count, articleList: [] };
    const articleList = await this.articleService.searchArticleList(finalQuery);
    return { count, articleList };
  }
}

const getSearchQuery = <T>(defaultQuery: T, query: any): T => {
  const finalQuery: any = { ...defaultQuery, ...query };

  finalQuery.kw = finalQuery.kw || '';
  finalQuery.skip = finalQuery.skip >= 0 ? finalQuery.skip : 0;
  finalQuery.take = finalQuery.take >= 1 ? finalQuery.take : 10;
  finalQuery.order = finalQuery.order === 'ASC' ? 'ASC' : 'DESC';

  if (!['createTime', 'updateTime', 'tagName'].includes(finalQuery.orderType)) {
    finalQuery.orderType = 'createTime';
  }

  let filterTypeArr: Array<'0' | '1'> = finalQuery.filterType
    .split(',')
    .map((item: string) => {
      if (['1', '0'].includes(item)) return item;
      return '1';
    });
  if (filterTypeArr.length !== 4) {
    filterTypeArr = ['1', '1', '1', '1'];
  }
  finalQuery.filterType = filterTypeArr.join(',');

  return finalQuery;
};
