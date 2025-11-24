// central API client for your Nest backend
import { PUBLIC_API_BASE } from '$env/static/public';
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import type {
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
	StatsResponse,
	FileItem,
	StorageUsageResponse,
	WeeklyActivityResponse
} from '$lib/types';

const BASE = PUBLIC_API_BASE || 'http://localhost:3000';

function authHeader() {
	const token = get(auth).token;
	return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleRes<T>(res: Response) {
	const text = await res.text();
	const data = text ? JSON.parse(text) : null;
	if (!res.ok) throw new Error(data?.message || res.statusText);
	return data as T;
}

export const api = {
	async login(body: LoginRequest): Promise<LoginResponse> {
		const res = await fetch(`${BASE}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		return handleRes<LoginResponse>(res);
	},

	async register(body: RegisterRequest): Promise<RegisterResponse> {
		const res = await fetch(`${BASE}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		return handleRes<RegisterResponse>(res);
	},

	async getStats(): Promise<StatsResponse> {
		const res = await fetch(`${BASE}/dashboard/stats`, {
			headers: { ...authHeader() }
		});
		return handleRes<StatsResponse>(res);
	},

	async getFiles(query: { q?: string; limit?: number; sort?: string } = {}): Promise<FileItem[]> {
		const params = new URLSearchParams();
		if (query.q) params.set('q', query.q);
		if (query.limit) params.set('limit', String(query.limit));
		if (query.sort) params.set('sort', query.sort);
		const res = await fetch(`${BASE}/files?${params.toString()}`, {
			headers: { ...authHeader() }
		});
		return handleRes<FileItem[]>(res);
	},

	async uploadFile(formData: FormData) {
		const res = await fetch(`${BASE}/files`, {
			method: 'POST',
			headers: { ...authHeader() },
			body: formData
		});
		return handleRes<any>(res);
	},

	async getRecentActivity() {
		const res = await fetch(`${BASE}/activity/recent`, {
			headers: { ...authHeader() }
		});
		return handleRes<{ message: string; timeAgo: string }[]>(res);
	},

	async getStorageUsage(): Promise<StorageUsageResponse> {
		const res = await fetch(`${BASE}/storage/usage`, {
			headers: { ...authHeader() }
		});
		return handleRes<StorageUsageResponse>(res);
	},

	async getWeeklyActivity(): Promise<WeeklyActivityResponse> {
		const res = await fetch(`${BASE}/activity/weekly`, {
			headers: { ...authHeader() }
		});
		return handleRes<WeeklyActivityResponse>(res);
	},

	async updateProfile(body: { name?: string; email?: string }) {
		const res = await fetch(`${BASE}/user`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', ...authHeader() },
			body: JSON.stringify(body)
		});
		return handleRes<any>(res);
	}
};
