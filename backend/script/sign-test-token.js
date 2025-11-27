// sign-test-token.js
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const keyPath = process.env.SERVICE_ACCOUNT_PRIV_KEY_PATH || path.resolve(__dirname, '../certs/service_account.key.pem');
const privateKey = fs.readFileSync(keyPath, 'utf8');

const payload = {
  iss: process.env.SERVICE_ACCOUNT_ISS || 'nest-api',
  sub: process.env.SERVICE_ACCOUNT_SUB || 'local-test',
  aud: 'ai-flask-service'
};

const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', header: { kid: process.env.SERVICE_ACCOUNT_KID || 'sa-key-1' }, expiresIn: '120s' });
console.log(token);
