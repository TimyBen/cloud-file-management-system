import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ServiceAccountService {
  private readonly logger = new Logger(ServiceAccountService.name);
  private readonly privateKey: jwt.Secret;
  private readonly issuer: string;
  private readonly defaultKid: string;

  constructor() {
    const keyPath =
      process.env.SERVICE_ACCOUNT_PRIV_KEY_PATH ||
      path.resolve(process.cwd(), 'certs/service_account.key.pem');
    if (!fs.existsSync(keyPath)) throw new Error('Private key missing');
    this.privateKey = fs.readFileSync(keyPath, 'utf8') as jwt.Secret;
    this.issuer = process.env.SERVICE_ACCOUNT_ISS || 'nest-api';
    this.defaultKid = process.env.SERVICE_ACCOUNT_KID || 'sa-key-1';
  }

  createToken(
    subject = 'nest-service',
    aud = 'ai-flask-service',
    ttlSeconds = 60,
    claims: Record<string, any> = {},
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.issuer,
      sub: subject,
      aud,
      iat: now,
      nbf: now - 5,
      exp: now + ttlSeconds,
      ...claims,
    };
    const signOptions: jwt.SignOptions = {
      algorithm: 'RS256',
      header: { kid: this.defaultKid } as any,
    };
    return jwt.sign(payload, this.privateKey, signOptions);
  }
}
