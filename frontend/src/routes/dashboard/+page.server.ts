import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

const API_BASE = 'http://localhost:3000';

export const load: PageServerLoad = async (event) => {
  const token = event.cookies.get('access_token');

  if (!token) {
    throw redirect(302, '/auth/login');
  }

  let user = null;
  let files: any[] = [];

  /** ─────────── GET PROFILE ─────────── */
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error('[dashboard] /auth/profile failed:', res.status);
      throw redirect(302, '/auth/login');
    }

    user = await res.json();
  } catch (e) {
    console.error('[dashboard] profile fetch error:', e);
    throw redirect(302, '/auth/login');
  }

  /** ─────────── GET FILES ─────────── */
  try {
    const res = await fetch(`${API_BASE}/files/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      files = await res.json();
      if (!Array.isArray(files)) files = [];
    } else {
      console.error('[dashboard] /files failed:', res.status);
      files = [];
    }
  } catch (e) {
    console.error('[dashboard] files fetch error:', e);
    files = [];
  }

  const totalSize = Array.isArray(files)
  ? files.reduce((sum, f) => sum + (Number(f.file_size) || 0), 0)
  : 0;

  const stats = {
    files: files.length,
    shares: 0,
    logs: 0,
    totalSize
  };

  return {
    user,
    files,
    stats
  };
};
