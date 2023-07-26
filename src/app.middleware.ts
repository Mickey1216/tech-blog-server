import { Injectable, NestMiddleware } from '@nestjs/common';
import { verifyToken } from './tools/jwt';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];
    req._id = false;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        req._id = payload._id;
      }
    }
    next();
  }
}
