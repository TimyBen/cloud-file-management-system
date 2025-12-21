/**
 * Full API client for the CloudStore frontend.
 * - Uses import.meta.env.VITE_API_URL as base
 * - Exports functions for Auth, Users, Files, Share, Logs, Collaboration, AI
 * - Upload uses XHR to provide progress callbacks
 *
 * NOTE: adjust endpoint paths to match your Nest.js backend where necessary.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/* ---------------------------
   Helper utilities & types
   --------------------------- */

type Json = Record<string, any>;

export class ApiError extends Error {
	status: number;
	body: string | Json | null;
	constructor(status: number, body: string | Json | null) {
		super(`API Error ${status}`);
		this.status = status;
		this.body = body;
	}
}

async function handleResponse(res: Response) {
	const ct = res.headers.get('content-type') ?? '';
	const text = await res.text().catch(() => '');
	if (!res.ok) {
		// try parse json else send text
		let body: Json | string | null = null;
		try {
			body = ct.includes('application/json') ? JSON.parse(text) : text;
		} catch {
			body = text;
		}
		throw new ApiError(res.status, body);
	}
	if (ct.includes('application/json')) {
		return JSON.parse(text);
	}
	// if binary or other, return the raw response object
	return res;
}

function authHeaders() {
	try {
		const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
		const headers = new Headers();
		if (token) headers.set('Authorization', `Bearer ${token}`);
		return headers;
	} catch {
		return new Headers();
	}
}

/* ---------------------------
   Interfaces
   --------------------------- */

export interface IUser {
	id: string;
	email: string;
	name?: string | null;
	roles?: string[];
	createdAt?: string;
	[k: string]: any;
}

export interface IAuthResult {
	token: string;
	user: IUser;
}

export interface IFile {
	id: string;
	name: string;
	size?: number;
	mime?: string;
	url?: string;
	createdAt?: string;
	ownerId?: string;
	[k: string]: any;
}

export interface IShare {
	id: string;
	fileId: string;
	link: string;
	expiresAt?: string;
	createdBy?: string;
	permissions?: string[]; // e.g. ['read']
}

/* ---------------------------
   Auth
   --------------------------- */

/**
 * POST /auth/login
 * body: { email, password }
 * returns { token, user }
 */
export async function login(email: string, password: string) {
	const res = await fetch(`${BASE}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	});

	const data = await handleResponse(res);

	return {
		token: data.access_token,
		refreshToken: data.refresh_token,
		user: data.user
	};
}

/**
 * POST /auth/register
 * body: { email, password, name? }
 */
export async function register(email: string | any, password?: string, display_name?: string) {
	let payload: any;

	// Accept register(email, password, display_name)
	if (typeof email === 'string') {
		payload = {
			email,
			password,
			display_name,
			role: 'user' // REQUIRED by your backend
		};
	} else {
		// Accept register({ email, password, display_name, role })
		payload = {
			...email,
			role: email.role ?? 'user'
		};
	}

	const res = await fetch(`${BASE}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const msg = await res.text().catch(() => 'Registration failed');
		throw new Error(msg);
	}

	return res.json();
}
/**
 * GET /auth/me
 */
export async function me(): Promise<IUser> {
	const res = await fetch(`${BASE}/auth/me`, {
		method: 'GET',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

/**
 * POST /auth/refresh
 * optional refresh pattern depends on your backend
 */
export async function refreshToken(): Promise<{ token: string }> {
	const res = await fetch(`${BASE}/auth/refresh`, {
		method: 'POST',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

/**
 * POST /auth/logout
 */
export async function logout(): Promise<void> {
	const res = await fetch(`${BASE}/auth/logout`, {
		method: 'POST',
		headers: authHeaders(),
		credentials: 'include'
	});
	await handleResponse(res);
}

/* ---------------------------
   Users
   --------------------------- */

export async function getUser(userId: string): Promise<IUser> {
	const res = await fetch(`${BASE}/users/${userId}`, {
		method: 'GET',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

export async function updateUser(userId: string, patch: Partial<IUser>): Promise<IUser> {
	const res = await fetch(`${BASE}/users/${userId}`, {
		method: 'PATCH',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify(patch)
	});
	return handleResponse(res);
}

/* ---------------------------
   Files
   --------------------------- */

/**
 * GET /files
 * optionally supports query params: ?page=1&pageSize=20&search=...
 */
export async function listFiles(query: Record<string, any> = {}): Promise<IFile[]> {
	const qs = new URLSearchParams();
	Object.entries(query).forEach(([k, v]) => {
		if (v !== undefined && v !== null) qs.set(k, String(v));
	});
	const url = `${BASE}/files${qs.toString() ? `?${qs.toString()}` : ''}`;
	const res = await fetch(url, {
		method: 'GET',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

/**
 * GET /files/:id
 */
export async function getFile(id: string): Promise<IFile> {
	const res = await fetch(`${BASE}/files/${id}`, {
		method: 'GET',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

/**
 * Upload a single file (multipart/form-data).
 * Uses XMLHttpRequest for progress callback.
 * POST /files
 *
 * onProgress: (percent: number) => void
 *
 * resolves to server response JSON (created file)
 */
export function uploadFile(file: File, onProgress?: (percent: number) => void): Promise<IFile> {
	return new Promise((resolve, reject) => {
		const url = `${BASE}/files`;
		const form = new FormData();
		form.append('file', file);
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		// include credentials if backend requires cookies
		xhr.withCredentials = true;
		const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
		if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

		xhr.upload.onprogress = (ev) => {
			if (ev.lengthComputable && onProgress) {
				const pct = Math.round((ev.loaded / ev.total) * 100);
				onProgress(pct);
			}
		};

		xhr.onload = () => {
			try {
				if (xhr.status >= 200 && xhr.status < 300) {
					const json = JSON.parse(xhr.responseText || '{}');
					resolve(json);
				} else {
					reject(new ApiError(xhr.status, xhr.responseText || null));
				}
			} catch (err) {
				reject(err);
			}
		};

		xhr.onerror = () => reject(new Error('Network error during file upload'));
		xhr.send(form);
	});
}

/**
 * Delete a file
 * DELETE /files/:id
 */
export async function deleteFile(id: string): Promise<void> {
	const res = await fetch(`${BASE}/files/${id}`, {
		method: 'DELETE',
		headers: authHeaders(),
		credentials: 'include'
	});
	await handleResponse(res);
}

/**
 * Get a download URL for a file id or a direct path.
 * - If the backend supports /files/:id/download, return that
 * - If the server returns absolute URLs in file.url, prefer that
 */

/**
 * Optional: get a presigned upload URL from the backend (for direct-to-S3 uploads)
 * POST /files/presign  { filename, mime, size }
 * returns { url, fields? } or { uploadUrl }
 */
export async function getPresignUrl(filename: string, mime?: string, size?: number): Promise<any> {
	const res = await fetch(`${BASE}/files/presign`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify({ filename, mime, size })
	});
	return handleResponse(res);
}

/* ---------------------------
   Share
   --------------------------- */

/**
 * POST /share - create share link
 * body: { fileId, expiresAt?, permissions? }
 */
export async function createShare(
	fileId: string,
	expiresAt?: string,
	permissions: string[] = ['read']
): Promise<IShare> {
	const res = await fetch(`${BASE}/share`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify({ fileId, expiresAt, permissions })
	});
	return handleResponse(res);
}

export async function listShares(fileId?: string): Promise<IShare[]> {
	const qs = fileId ? `?fileId=${encodeURIComponent(fileId)}` : '';
	const res = await fetch(`${BASE}/share${qs}`, {
		method: 'GET',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

export async function revokeShare(shareId: string): Promise<void> {
	const res = await fetch(`${BASE}/share/${shareId}`, {
		method: 'DELETE',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

/* ---------------------------
   Logs
   --------------------------- */

/**
 * GET /logs
 * supports ?page=&pageSize=&filter=
 */
export async function listLogs(query: Record<string, any> = {}): Promise<any> {
	const qs = new URLSearchParams();
	Object.entries(query).forEach(([k, v]) => {
		if (v !== undefined && v !== null) qs.set(k, String(v));
	});
	const res = await fetch(`${BASE}/logs${qs.toString() ? `?${qs.toString()}` : ''}`, {
		method: 'GET',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

/* ---------------------------
   Collaboration (WebSocket / Gateway)
   --------------------------- */

/**
 * HTTP helpers for session creation and simple messages.
 *
 * POST /collab/session  -> { sessionId, token? }
 * POST /collab/:sessionId/join -> { participant }
 * POST /collab/:sessionId/leave
 * POST /collab/:sessionId/message { message }
 */

export async function createCollabSession(
	payload: { name?: string; fileId?: string } = {}
): Promise<any> {
	const res = await fetch(`${BASE}/collab/session`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify(payload)
	});
	return handleResponse(res);
}

export async function joinCollabSession(sessionId: string, displayName?: string): Promise<any> {
	const res = await fetch(`${BASE}/collab/${encodeURIComponent(sessionId)}/join`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify({ displayName })
	});
	return handleResponse(res);
}

export async function leaveCollabSession(sessionId: string): Promise<void> {
	const res = await fetch(`${BASE}/collab/${encodeURIComponent(sessionId)}/leave`, {
		method: 'POST',
		headers: authHeaders(),
		credentials: 'include'
	});
	return handleResponse(res);
}

export async function sendCollabMessage(sessionId: string, message: string): Promise<any> {
	const res = await fetch(`${BASE}/collab/${encodeURIComponent(sessionId)}/message`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify({ message })
	});
	return handleResponse(res);
}

/* ---------------------------
   AI / ML microservices (Flask)
   --------------------------- */

/**
 * POST /ai/search - body: { q }
 * returns semantic search hits
 */
export async function semanticSearch(q: string, topK = 10): Promise<any> {
	const res = await fetch(`${BASE}/ai/search`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify({ q, topK })
	});
	return handleResponse(res);
}

/**
 * POST /ai/anomaly - body: { userId?, from?, to? }
 */
export async function detectAnomalies(payload: Record<string, any> = {}): Promise<any> {
	const res = await fetch(`${BASE}/ai/anomaly`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify(payload)
	});
	return handleResponse(res);
}

/**
 * POST /ai/forecast - body: { fileId }
 */
export async function forecastLifecycle(fileId: string): Promise<any> {
	const res = await fetch(`${BASE}/ai/forecast`, {
		method: 'POST',
		headers: ((): Headers => {
			const h = authHeaders();
			h.set('Content-Type', 'application/json');
			return h;
		})(),
		credentials: 'include',
		body: JSON.stringify({ fileId })
	});
	return handleResponse(res);
}

/* ---------------------------
   Utilities
   --------------------------- */

/**
 * Simple convenience wrapper for fetching binary blobs (download)
 */
export async function downloadFileBlob(fileOrId: string): Promise<Blob> {
	const url = fileDownloadUrl(fileOrId);
	const res = await fetch(url, {
		method: 'GET',
		headers: authHeaders(),
		credentials: 'include'
	});
	const handled = await handleResponse(res);
	if (handled instanceof Response) {
		// should not happen since handleResponse returns res for non-json,
		// but we include fallback
		return handled.blob();
	} else if (handled instanceof Blob) {
		return handled;
	} else {
		// If handleResponse parsed JSON, try fetching raw again
		const res2 = await fetch(url, {
			method: 'GET',
			headers: authHeaders(),
			credentials: 'include'
		});
		return res2.blob();
	}
}

export function fileDownloadUrl(fileOrId: string) {
	if (fileOrId.startsWith('http') || fileOrId.startsWith('/')) return fileOrId;
	return `${BASE}/files/${fileOrId}/download`;
}

/* ---------------------------
   Export default (optional)
   --------------------------- */

export default {
	// Auth
	login,
	register,
	me,
	refreshToken,
	logout,
	// Users
	getUser,
	updateUser,
	// Files
	listFiles,
	getFile,
	uploadFile,
	deleteFile,
	//   fileDownloadUrl,
	downloadFileBlob,
	getPresignUrl,
	// Share
	createShare,
	listShares,
	revokeShare,
	// Logs
	listLogs,
	// Collab
	createCollabSession,
	joinCollabSession,
	leaveCollabSession,
	sendCollabMessage,
	// AI
	semanticSearch,
	detectAnomalies,
	forecastLifecycle
};
