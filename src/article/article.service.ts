import { Article } from './entities/article.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private readonly article: Repository<Article>,
  ) {}

  addArticle(article) {
    const data = createArticle(article);
    return this.article.save(data);
  }

  deleteArticle(id: string) {
    return this.article.delete(id);
  }

  updateArticle(id, article) {
    const data = createArticle(article);
    return this.article.update(id, data);
  }

  getArticle(where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[]) {
    return this.article.findOne({
      where,
      relations: ['tag'],
    });
  }

  getArticleList(
    where: FindOptionsWhere<Article> | FindOptionsWhere<Article>[],
  ) {
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
        'publicState',
      ],
      where,
      relations: ['tag'],
    });
  }

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
        'tag',
      ]);

    res = searchArticleListWhereBuilder(res, { filterTypeArr, kw });

    if (orderType === 'createTime')
      res = res.orderBy('article.createTime', order);
    else if (orderType === 'updateTime')
      res = res.orderBy('article.updateTime', order);
    else if (orderType === 'tagName') {
      res = res
        .orderBy('tag.name', order)
        .addOrderBy('article.createTime', order);
    }

    const articleList = res.skip(skip).take(take).getMany();
    return articleList;
  }

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

const createArticle = ({
  title,
  tagId,
  introduction,
  content,
  createTime,
  updateTime,
  publicState,
  filename,
}) => {
  const data = new Article();
  data.title = title;
  data.tagId = tagId;
  data.introduction = introduction;
  data.content = content;
  data.createTime = createTime;
  data.updateTime = updateTime;
  data.publicState = publicState;
  if (filename) {
    data.imageSrc = filename;
  }
  return data;
};

const searchArticleListWhereBuilder = (
  res: SelectQueryBuilder<Article>,
  { filterTypeArr, kw },
) => {
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
