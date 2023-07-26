import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as cors from "cors";
import { join } from "path";
import * as history from "connect-history-api-fallback";
// "compression"是一个Node.js的中间件（middleware），用于在Express.js应用程序中对响应进行压缩，以减少传输的数据量，从而提高网站的加载速度和性能
import * as compression from "compression";
import rateLimit from "express-rate-limit";
// "Helmet"是一个Node.js的中间件（middleware），用于增强Express.js应用程序的安全性
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  // 创建app
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 设置访问频率
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000 // 限制15分钟内最多只能访问1000次
    })
  );

  // web安全，防常见漏洞
  // 注意：开发环境如果开启nest static module，则需要将crossOriginResourcePolicy设置为false，否则静态资源在跨域时不可访问
  // { crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, crossOriginResourcePolicy: false }
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: false
    })
  );

  // 处理前端路由
  app.use(history());

  // 配置cors跨域
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://192.168.0.52:3000",
        "http://47.115.221.109:3000",
        "http://172.20.10.3:3000"
      ]
    })
  );

  // 开启gzip压缩
  app.use(compression());

  // 配置静态资源
  app.useStaticAssets(join(__dirname, "../public"), {
    maxAge: "1h", // 强缓存
    etag: true // 协商缓存
  });

  // 监听端口
  await app.listen(3002);
}

bootstrap();
