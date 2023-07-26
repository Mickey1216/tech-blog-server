import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppMiddleware } from './app.middleware';

import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { TagModule } from './tag/tag.module';


@Module({
  imports: [
    // TypeOrm连接MySQL数据库的配置
    TypeOrmModule.forRoot({
      type: 'mysql', // 数据库类型
      host: 'localhost', // 数据库的连接地址host
      port: 3306, // 数据库的端口，3306
      username: 'root', // 连接账号
      password: 'LL586402', // 连接密码
      database: 'tech_blog', // 连接的数据库名称
      retryDelay: 1000, // 重试连接数据库间隔
      retryAttempts: 10, // 允许重连次数
      synchronize: true, // 是否将实体同步到数据库
      autoLoadEntities: true // 自动加载实体配置，forFeature()注册的每个实体都自己动加载
    }),
    UserModule,
    ArticleModule,
    TagModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // 配置jwt中间件
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes('');
  }
}
