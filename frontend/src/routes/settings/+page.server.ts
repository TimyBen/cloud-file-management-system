import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { user } = await parent();

  // Redirect to login if not authenticated
  if (!user) {
    throw redirect(302, '/auth/login');
  }

  return {
    // Page data
  };
};