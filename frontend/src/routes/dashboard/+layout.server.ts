import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const API_BASE = 'http://localhost:3000';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('access_token');

	if (!token) throw redirect(302, '/auth/login');

	const res = await fetch(`${API_BASE}/auth/profile`, {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!res.ok) throw redirect(302, '/auth/login');

	const user = await res.json();

	return {
		token,
		user
	};
};
