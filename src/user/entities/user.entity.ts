import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';

@Entity()
export class User {
  // 用户id
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 推荐列表id
  @Column("simple-array")
  recommendIdList: string[];

  // 用户名
  @Column({ type: 'varchar', length: 32 })
  username: string;

  // 密码
  @Column({ type: 'varchar', length: 64 })
  password: string;

  // 创建时间
  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;
}
