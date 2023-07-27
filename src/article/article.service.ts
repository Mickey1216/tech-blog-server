import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(@InjectRepository(Article) private readonly article: Repository<Article>) {}

  // 增加文章
  addArticle(article) {
    const data = createArticle(article);
    return this.article.save(data);
  }

  // 删除文章（根据id）
  deleteArticle(id: string) {
    return this.article.delete(id);
  }

  // 更新文章
  updateArticle(id, article) {
    const data = createArticle(article);
    return this.article.update(id, data);
  }

  // 根据条件获取某篇文章
  getArticle(where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[]) {
    return this.article.findOne({
      where,
      relations: ['tag']
    });
  }

  // 根据条件获取文章列表
  getArticleList(where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[]) {
    return this.article.find({
      select: [
        'createTime',
        'id',
        'imageSrc',
        'introduction',
        'updateTime',
        'tag',
        'tagId',
        'title',
        'publicState'
      ],
      where,
      relations: ['tag']
    });
  }

  // 搜索文章列表
  searchArticleList({ skip, take, kw, order, orderType, filterType }) {
    const filterTypeArr = filterType.split(',') as Array<'1' | '0'>;

    let res = this.article
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tag', 'tag')
      .select([
        'article.createTime',
        'article.id',
        'article.imageSrc',
        'article.introduction',
        'article.updateTime',
        'article.tagId',
        'article.title',
        'article.publicState',
        'tag'
      ]);
    res = searchArticleListWhereBuilder(res, { filterTypeArr, kw });

    // 根据条件进行排序
    if (orderType === 'createTime')
      res = res.orderBy('article.createTime', order);
    else if (orderType === 'updateTime')
      res = res.orderBy('article.updateTime', order);
    else if (orderType === 'tagName') {
      res = res
        .orderBy('tag.name', order)
        .addOrderBy('article.createTime', order);
    }

    // 文章列表
    const articleList = res.skip(skip).take(take).getMany();
    return articleList;
  }

  // 获取搜索文章列表的个数
  searchArticleListCount({ kw, filterType }) {
    const filterTypeArr = filterType.split(',') as Array<'1' | '0'>;

    let res = this.article
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tag', 'tag');
    res = searchArticleListWhereBuilder(res, { filterTypeArr, kw });

    const count = res.getCount();
    return count;
  }
}

// 创建文章
const createArticle = ({
  title,
  tagId,
  introduction,
  content,
  createTime,
  updateTime,
  publicState,
  filename
}) => {
  const article = new Article();
  article.title = title;
  article.tagId = tagId;
  article.introduction = introduction;
  article.content = content;
  article.createTime = createTime;
  article.updateTime = updateTime;
  article.publicState = publicState;
  if (filename) {
    article.imageSrc = filename;
  }

  return article;
};

// 构建搜索文章列表的查询条件
const searchArticleListWhereBuilder = (res: SelectQueryBuilder<Article>, { filterTypeArr, kw }) => {
  if (filterTypeArr[0] === '1')
    res = res.orWhere('article.title like :kw', { kw: `%${kw}%` });
  if (filterTypeArr[1] === '1')
    res = res.orWhere('article.introduction like :kw', { kw: `%${kw}%` });
  if (filterTypeArr[2] === '1')
    res = res.orWhere('article.content like :kw', { kw: `%${kw}%` });
  if (filterTypeArr[3] === '1')
    res = res.orWhere('tag.name like :kw', { kw: `%${kw}%` });

  return res;
};
