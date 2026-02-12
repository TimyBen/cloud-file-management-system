import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

const API_BASE = 'http://localhost:3000';

export const load: PageServerLoad = async (event) => {
  // If cookie isn't present, user is not logged in
  const access = event.cookies.get('access_token');
  if (!access) throw redirect(303, '/auth/login');

  // Forward cookies from the incoming request to the API (SSR -> API)
  const cookieHeader = event.request.headers.get('cookie') ?? '';

  const apiFetch = (path: string) =>
    event.fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: {
        // Use "Cookie" casing; some servers/proxies behave better with it
        Cookie: cookieHeader,
        Accept: 'application/json'
      },
      cache: 'no-store'
    });

  // ------- PROFILE -------
  const profileRes = await apiFetch('/auth/profile');

  if (profileRes.status === 401 || profileRes.status === 403) {
    event.cookies.delete('access_token', { path: '/' });
    event.cookies.delete('refresh_token', { path: '/' });
    throw redirect(303, '/auth/login');
  }

  if (!profileRes.ok) {
    console.error('[dashboard] /auth/profile failed:', profileRes.status, await safeText(profileRes));
    throw redirect(303, '/auth/login');
  }

  const user = await profileRes.json();

  // ------- FILES -------
  let files: any[] = [];
  const filesRes = await apiFetch('/files');

  if (filesRes.status === 401 || filesRes.status === 403) {
    event.cookies.delete('access_token', { path: '/' });
    event.cookies.delete('refresh_token', { path: '/' });
    throw redirect(303, '/auth/login');
  }

  if (!filesRes.ok) {
    console.error('[dashboard] /files failed:', filesRes.status, await safeText(filesRes));
    files = [];
  } else {
    const data = await filesRes.json();
    files = Array.isArray(data) ? data : [];
  }

  const totalSize = files.reduce((sum, f) => sum + (Number(f?.file_size) || 0), 0);

  const stats = {
    files: files.length,
    shares: files.filter((f) => f?.shared || f?.share_url).length,
    logs: 0,
    totalSize
  };

  return { user, files, stats };
};

// ---- helpers ----
async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}
