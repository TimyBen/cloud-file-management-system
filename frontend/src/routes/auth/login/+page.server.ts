import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

const API_BASE = 'http://localhost:3000';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		const res = await fetch(`${API_BASE}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		if (!res.ok) {
			return fail(401, { error: 'Invalid email or password.' });
		}

		const data = await res.json();

		const token = data.token ?? data.accessToken ?? data.access_token;
		const refresh = data.refreshToken ?? data.refresh_token;

		if (!token || !refresh) {
			return fail(500, { error: 'Login response missing tokens.' });
		}

		event.cookies.set('access_token', token, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60
		});

		event.cookies.set('refresh_token', refresh, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24 * 7
		});

		throw redirect(302, '/dashboard');
	}
};
