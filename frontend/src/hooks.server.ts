import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    return await resolve(event);
  } catch (err) {
    console.error('SSR crash on', event.url.pathname, err);
    throw err;
  }
};

export const handleError: HandleServerError = ({ error, event }) => {
  console.error('handleError:', event.url.pathname, error);
  return { message: 'Server error' };
};
