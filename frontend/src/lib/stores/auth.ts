import { writable } from "svelte/store";

export const token = writable<string | null>(null);
export const user = writable<{ id: string; email: string } | null>(null);

export function setAuth(newToken: string, newUser: { id: string; email: string }) {
  token.set(newToken);
  user.set(newUser);
  localStorage.setItem("token", newToken);
  localStorage.setItem("user", JSON.stringify(newUser));
}

export function clearAuth() {
  token.set(null);
  user.set(null);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function loadAuth() {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (storedToken && storedUser) {
    token.set(storedToken);
    user.set(JSON.parse(storedUser));
  }
}
