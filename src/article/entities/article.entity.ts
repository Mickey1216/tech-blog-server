import { Tag } from './../../tag/entities/tag.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64 })
  title: string;

  @Column({ type: 'varchar', length: 64 })
  tagId: string;

  @Column({ type: 'varchar', length: 256 })
  introduction: string;

  @Column({ type: 'varchar', length: 15360 })
  content: string;

  @Column({ type: 'varchar', length: 64 })
  imageSrc: string;

  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updateTime: Date;

  @ManyToOne(() => Tag, (tag) => tag.article)
  tag: Tag;

  @Column({ type: 'boolean', default: true })
  publicState: boolean;

  sortValue: number;
}
