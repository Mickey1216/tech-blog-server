import { genSaltSync, hashSync, compareSync } from 'bcrypt';

/**
 * 对密码加密
 * @param pwd 明文密码
 * @returns 加密后的密码
 */
export const encryption = function (pwd: string) {
  // 生成盐
  const salt = genSaltSync(10);
  // 对明文加密
  const hash = hashSync(pwd, salt);
  return hash;
};

/**
 * 验证密码
 * @param pwd 待验证的密码
 * @param hash 上次操作之后加密后的密码
 * @returns 是否验证成功
 */
export const verification = function (pwd: string, hash: string) {
  if (!pwd || !hash) return false;
  // 验证密码
  const isOk = compareSync(pwd, hash);
  return isOk;
};
