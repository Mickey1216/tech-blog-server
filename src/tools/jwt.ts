import { JwtPayload, sign, verify } from 'jsonwebtoken';

const secret = 'techBlog'; // 密钥
const expiresIn = 60 * 60 * 24 * 30; // 30天

/**
 * 生成token
 * @param _id 用户id
 * @returns token
 */
export const generateToken = function (_id) {
  const payload = { _id };
  const token = sign(payload, secret, { expiresIn });
  return token;
};

// 定义Payload接口，需要继承JwtPayload接口
interface Payload extends JwtPayload {
  _id: string;
}

/**
 * 解析token
 * @param token token
 * @returns payload或者false
 */
export const verifyToken = function (token) {
  try {
    const payload = verify(token, secret) as Payload;
    return payload;
  } catch (error) {
    console.log('无法解析token或者token超时!');
    return false;
  }
};
