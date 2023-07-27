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
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Not, In } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ArticleService } from './article.service';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly userService: UserService
  ) {}

  // 增加文章（文章标题唯一）
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async addArticle(@UploadedFile() file, @Body() body) {
    // 处理文章长度
    const article = JSON.parse(body.article);
    if (article.content.length > 15360) return { error: '文章长度超出' };

    // 判断是否已经存在该文章标题
    const data = await this.articleService.getArticle({
      title: article.title
    });
    if (data) return { error: '存在相同标题的文章' };

    // 处理文章创建时间和修改时间
    article.createTime = new Date(article.createTime);
    article.updateTime = new Date(article.updateTime);

    return this.articleService.addArticle({
      filename: file.filename,
      ...article
    });
  }

  // 删除文章
  @Delete('')
  async deleteArticle(@Body() { id }) {
    return await this.articleService.deleteArticle(id);
  }

  // 修改文章
  @Put('')
  @UseInterceptors(FileInterceptor('file'))
  async updateArticle(@UploadedFile() file, @Body() body) {
    // 处理文章长度
    const article = JSON.parse(body.article);
    if (article.content.length > 15360) return { error: '文章长度超出' };

    // 判断是否已经存在此标题以及判断文章id是否合法
    const id = article.id;
    const data = await this.articleService.getArticle({
      title: article.title,
      id: Not(id)
    });
    if (data) return { error: '存在相同标题的文章' };
    if (!id) return { error: '没有id' };

    // 处理文章创建时间和修改时间
    article.createTime = new Date(article.createTime);
    article.updateTime = new Date(article.updateTime);

    // 更新
    this.articleService.updateArticle(id, {
      ...article,
      filename: file?.filename || null
    });

    return await this.articleService.getArticle({ id });
  }

  // 根据查询参数（文章id）获取文章
  @Get(':id')
  async getArticle(@Param() { id }, @Req() { _id }) {
    const res = await this.articleService.getArticle({ id });

    // 无效的文章id
    if (!res) return { error: '数据加载错误，可能是无效的id' };

    // 私有文章
    if (!_id && !res.publicState) {
      return { error: '私有文章，无法查看' };
    }

    return res;
  }

  // 获取推荐文章列表
  @Post('recommendList')
  async getArticleRecommendList(@Body() { recommendIdList, defaultData }) {
    // 未给推荐列表，取默认用户的推荐列表
    if (!recommendIdList.length) {
      const user = await this.userService.getUser({});
      recommendIdList = user?.recommendIdList;
    }

    let res = await this.articleService.getArticleList({
      id: In(recommendIdList || [])
    });
    if (res.length) { // 有推荐列表数据
      res.forEach((item) => {
        item.sortValue = recommendIdList.indexOf(item.id);
      });
      res = res.sort((a, b) => a.sortValue - b.sortValue); // 按照升序排列
      return res;
    }

    if (!defaultData) return []; // false不给

    // 配置项为true时，给予最近的文章作为推荐列表数据
    return this.articleService.searchArticleList({
      kw: '',
      order: 'DESC',
      skip: 0,
      take: 10,
      orderType: 'createTime', // 根据文章创建时间降序排列
      filterType: '1,1,1,1'
    });
  }

  // 根据查询条件获取文章
  @Get('')
  async searchArticle(@Query() query) {
    // 默认查询条件
    const defaultQuery = {
      kw: '',
      order: 'DESC',
      skip: 0,
      take: 20,
      orderType: 'createTime',
      filterType: '1,1,1,1'
    };

    // 最终查询条件
    const finalQuery = getSearchQuery(defaultQuery, query);

    // 根据查询条件获取的文章列表个数
    const count = await this.articleService.searchArticleListCount(finalQuery);
    if (count === 0) return { count, articleList: [] };

    // 根据查询条件获取的文章列表
    const articleList = await this.articleService.searchArticleList(finalQuery);
    return { count, articleList };
  }
}

// 构建最终的查询条件
const getSearchQuery = <T>(defaultQuery: T, query: any): T => {
  const finalQuery: any = { ...defaultQuery, ...query };

  finalQuery.kw = finalQuery.kw || '';
  finalQuery.skip = finalQuery.skip >= 0 ? finalQuery.skip : 0;
  finalQuery.take = finalQuery.take >= 1 ? finalQuery.take : 10;
  finalQuery.order = finalQuery.order === 'ASC' ? 'ASC' : 'DESC';

  // 指定createTime为默认的orderType
  if (!['createTime', 'updateTime', 'tagName'].includes(finalQuery.orderType)) {
    finalQuery.orderType = 'createTime'; 
  }

  // 处理filterType
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