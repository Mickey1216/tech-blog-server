import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { Article } from 'src/article/entities/article.entity';


@Entity()
export class Tag {
  // 标签id
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 标签名
  @Column({ type: 'varchar', length: 32 })
  name: string;

  // 标签颜色
  @Column({ type: 'varchar', length: 16 })
  color: string;

  // 标签创建时间
  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;

  // 映射关系：一对多（一个标签会对应多篇文章）
  @OneToMany(() => Article, (article) => article.tag)
  article: Article[];
}
