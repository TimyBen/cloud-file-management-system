// src/lib/stores/auth.ts
import { writable } from "svelte/store";
import type { IUser } from "$lib/types/types";
import { browser } from "$app/environment";

export interface AuthState {
  token: string | null;
  user: IUser | null;
}

const initial: AuthState = { token: null, user: null };

const store = writable<AuthState>(initial);

function persist(state: AuthState) {
  if (!browser) return;
  if (state.token) {
    localStorage.setItem("auth.token", state.token);
    localStorage.setItem("auth.user", JSON.stringify(state.user));
  } else {
    localStorage.removeItem("auth.token");
    localStorage.removeItem("auth.user");
  }
}

/* Named helpers - exported for direct use */
export function setAuth(token: string, user: IUser) {
  store.set({ token, user });
  persist({ token, user });
}

export function loadAuth() {
  if (!browser) return;
  const token = localStorage.getItem("auth.token");
  const userJson = localStorage.getItem("auth.user");
  const user = userJson ? (JSON.parse(userJson) as IUser) : null;
  if (token) store.set({ token, user });
}

export function clearAuth() {
  store.set(initial);
  persist(initial);
}

/* Default store with helpful methods */
function createAuthStore() {
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update,
    async login(fn: (body: any) => Promise<any>) {
      // optional convenience wrapper for UI usage
      return fn;
    },
    reset() {
      clearAuth();
    }
  };
}

export const auth = createAuthStore();
