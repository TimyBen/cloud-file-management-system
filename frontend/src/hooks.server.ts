// src/hooks.server.ts
import { verifyJwt } from '$lib/utils/jwt';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const cookie = event.request.headers.get('cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (match) {
    try {
      // verify token and set user in locals
      // note: verifyJwt returns decoded payload or throws
      const decoded = await verifyJwt(match[1]);
      event.locals.user = decoded;
    } catch (err) {
      // invalid token — ignore, user stays unauthenticated
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return await resolve(event);
};
