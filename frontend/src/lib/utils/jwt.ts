// src/lib/utils/jwt.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';

export function signJwt(payload: Record<string, any>, opts: jwt.SignOptions = {}) {
  // token expires set in options or default 4h
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, SECRET, { expiresIn: '4h', ...opts }, (err, token) => {
      if (err) return reject(err);
      resolve(token as string);
    });
  });
}

export function verifyJwt(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}
