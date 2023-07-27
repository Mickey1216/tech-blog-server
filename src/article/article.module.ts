import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { UserModule } from 'src/user/user.module';
import { Article } from './entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    MulterModule.register({ // 处理文件上传
      storage: diskStorage({
        destination: join(__dirname, '../../public/images'),
        filename: (_, file, callback) => {
          const fileName = `${file.originalname}`;
          return callback(null, fileName);
        }
      })
    }),
    UserModule
  ],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {}
