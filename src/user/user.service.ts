import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly user: Repository<User>) {}

  /**
   * 添加新用户
   * @param param { 用户名， 密码 } 
   * @returns 
   */
  addUSer({ username, password }) {
    const user = new User();
    user.username = username;
    user.password = password;
    user.recommendIdList = [];
    return this.user.save(user);
  }

  /**
   * 获取用户
   * @param username 查询条件：用户名
   * @returns 
   */
  getUser(username) {
    return this.user.findOne({ where: username });
  }

  /**
   * 更新用户推荐列表
   * @param recommendIdList 用户推荐列表
   * @param id 用户id
   * @returns 
   */
  updateUserRecommendList(recommendIdList: string[], id) {
    return this.user.update(id, { recommendIdList });
  }
}
