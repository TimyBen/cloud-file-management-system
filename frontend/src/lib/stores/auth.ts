import { writable } from 'svelte/store';
import { api } from '$lib/api/index';
import type { LoginRequest, LoginResponse } from '$lib/types';
import { browser } from '$app/environment';

interface AuthState {
  token?: string | null;
  user?: any | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({ token: null, user: null });

  function persist(state: AuthState) {
    if (!browser) return;
    if (state.token) {
      localStorage.setItem('auth.token', state.token);
      localStorage.setItem('auth.user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('auth.token');
      localStorage.removeItem('auth.user');
    }
  }

  return {
    subscribe,
    async login(body: LoginRequest) {
      const res: LoginResponse = await api.login(body);
      const token = (res as any).token;
      const user = (res as any).user;
      set({ token, user });
      persist({ token, user });
      return res;
    },
    async logout() {
      set({ token: null, user: null });
      persist({ token: null, user: null });
    },
    initFromStorage() {
      if (!browser) return;
      const token = localStorage.getItem('auth.token');
      const userJson = localStorage.getItem('auth.user');
      const user = userJson ? JSON.parse(userJson) : null;
      if (token) set({ token, user });
    },
    setToken(token: string | null) {
      update(s => {
        s.token = token;
        persist(s);
        return s;
      });
    },
    setUser(user: any | null) {
      update(s => {
        s.user = user;
        persist(s);
        return s;
      });
    },
    reset() {
      set({ token: null, user: null });
      persist({ token: null, user: null });
    },
    set
  };
}

export const auth = createAuthStore();
