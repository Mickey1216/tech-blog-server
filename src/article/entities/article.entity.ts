import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne
} from 'typeorm';
import { Tag } from './../../tag/entities/tag.entity';

@Entity()
export class Article {
  // 文章id
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 文章标题
  @Column({ type: 'varchar', length: 64 })
  title: string;

  // 文章简介
  @Column({ type: 'varchar', length: 256 })
  introduction: string;

  // 文章内容
  @Column({ type: 'varchar', length: 15360 })
  content: string;

  // 文章封面图片
  @Column({ type: 'varchar', length: 64 })
  imageSrc: string;

  // 文章公开true/私有false
  @Column({ type: 'boolean', default: true })
  publicState: boolean;

  // 文章创建时间
  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;

  // 文章更新时间
  @CreateDateColumn({ type: 'timestamp' })
  updateTime: Date;

  // 标签id
  @Column({ type: 'varchar', length: 64 })
  tagId: string;

  // 映射关系：多对一（多篇文章会对应一个标签）
  @ManyToOne(() => Tag, (tag) => tag.article)
  tag: Tag;

  sortValue: number;
}
