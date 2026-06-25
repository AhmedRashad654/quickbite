import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { InvalidToken } from '../../lib/auth/error.js';
import { JwtPayloadType } from '../../lib/types/jwtPayload.js';
import { env } from '../../lib/config/env.js';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function createAccessToken(payload: JwtPayloadType): string {
  const options: SignOptions = { expiresIn: Number(env.jwt.accessExpiresIn) };
  return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function createRefreshToken(payload: JwtPayloadType): string {
  const options: SignOptions = { expiresIn: Number(env.jwt.refreshExpiresIn) };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayloadType {
  try {
    return jwt.verify(token, env.jwt.accessSecret) as JwtPayloadType;
  } catch {
    throw InvalidToken;
  }
}

export function verifyRefreshToken(token: string): JwtPayloadType {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayloadType;
  } catch {
    throw InvalidToken;
  }
}

export function comparePassword(passwordInput: string, hashedPassword: string) {
  return bcrypt.compare(passwordInput, hashedPassword);
}

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOTP(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}
