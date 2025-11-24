// src/routes/api/auth/login/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getUserByEmail } from '$lib/api/users';
import { signJwt } from '$lib/utils/jwt';
import bcrypt from 'bcrypt';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password, remember } = body || {};

    if (!email || !password) {
      return json({ message: 'Missing email or password' }, { status: 400 });
    }

    const user = await getUserByEmail(email.toLowerCase());
    if (!user) {
      return json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // sign JWT
    const token = await signJwt({ sub: user.id, email: user.email });

    // cookie settings
    const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 4;
    const cookieParts = [
      `session=${token}`,
      `HttpOnly`,
      `Path=/`,
      `Max-Age=${maxAge}`,
      `SameSite=Strict`
    ];
    if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');

    return new Response(JSON.stringify({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieParts.join('; ')
      }
    });
  } catch (err) {
    console.error('auth/login error', err);
    return json({ message: 'Server error' }, { status: 500 });
  }
};
