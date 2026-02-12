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

		// Call Nest. Nest will set HttpOnly cookies.
		const res = await event.fetch(`${API_BASE}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});

		if (!res.ok) {
			let msg = 'Invalid email or password.';
			try {
				const j = await res.json();
				if (j?.message) msg = Array.isArray(j.message) ? j.message.join(', ') : String(j.message);
			} catch {}
			return fail(res.status, { error: msg });
		}

		// ✅ Forward Set-Cookie headers from Nest -> Browser
		// Node fetch collapses multiple set-cookie headers; use getSetCookie() when available.
		const setCookies =
			// @ts-expect-error - getSetCookie exists in undici/Node fetch
			typeof res.headers.getSetCookie === 'function'
				// @ts-expect-error - same
				? res.headers.getSetCookie()
				: (() => {
						const single = res.headers.get('set-cookie');
						return single ? [single] : [];
				  })();

		if (!setCookies.length) {
			// If you hit this, Nest isn't setting cookies, or CORS/credentials config is wrong
			return fail(500, { error: 'Login succeeded but no auth cookies were set by API.' });
		}

		for (const c of setCookies) {
			// Append, not set (multiple cookies)
			event.cookies.set(
				// We must parse cookie name/value ourselves? NO: SvelteKit cookies API doesn't accept raw header.
				// So we need to forward raw Set-Cookie using response headers instead.
				// This action runs on server; the right way is: set the raw header on the response using event.setHeaders.
				// But actions can't directly set headers; use event.cookies.set with parsed values.
				//
				// Therefore: parse minimal cookie name/value + options.
				...parseSetCookie(c)
			);
		}

		throw redirect(303, '/dashboard');
	}
};

// --- minimal Set-Cookie parser for SvelteKit cookies.set(name, value, options) ---
function parseSetCookie(setCookie: string): [string, string, Parameters<import('@sveltejs/kit').Cookies['set']>[2]] {
	const parts = setCookie.split(';').map((p) => p.trim());
	const [nameValue, ...attrs] = parts;
	const eq = nameValue.indexOf('=');
	const name = nameValue.slice(0, eq);
	const value = nameValue.slice(eq + 1);

	const options: any = { path: '/' };

	for (const a of attrs) {
		const [kRaw, vRaw] = a.split('=');
		const k = kRaw.toLowerCase();

		if (k === 'httponly') options.httpOnly = true;
		else if (k === 'secure') options.secure = true;
		else if (k === 'path' && vRaw) options.path = vRaw;
		else if (k === 'samesite' && vRaw) options.sameSite = vRaw.toLowerCase();
		else if (k === 'max-age' && vRaw) options.maxAge = Number(vRaw);
		else if (k === 'expires' && vRaw) options.expires = new Date(vRaw);
	}

	return [name, value, options];
}
