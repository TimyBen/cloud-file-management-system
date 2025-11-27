import { redirect } from '@sveltejs/kit';

export async function POST({ cookies }) {
    // Delete cookie by setting it to blank + expired date
    cookies.set('access_token', '', {
        path: '/',
        expires: new Date(0)
    });

    throw redirect(302, '/auth/login');
}
