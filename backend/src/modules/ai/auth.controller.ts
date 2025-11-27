import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Controller('.well-known')
export class AuthController {
  @Get('service-jwks.json')
  jwks() {
    const pubPath =
      process.env.SERVICE_ACCOUNT_PUB_KEY_PATH ||
      path.resolve(process.cwd(), 'certs/service_account.pub.pem');
    if (!fs.existsSync(pubPath)) return { keys: [] };
    const pem = fs.readFileSync(pubPath, 'utf8');
    const kid =
      process.env.SERVICE_ACCOUNT_KID ||
      crypto.createHash('sha256').update(pem).digest('hex').slice(0, 16);
    return {
      keys: [
        {
          kid,
          kty: 'RSA',
          alg: 'RS256',
          use: 'sig',
          x5c: [Buffer.from(pem).toString('base64')],
        },
      ],
      pem,
    };
  }
}
