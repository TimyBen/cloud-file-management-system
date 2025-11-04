const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
