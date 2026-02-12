import { writable, get } from "svelte/store";
import type { IUser } from "$lib/types/types";
import { browser } from "$app/environment";
import { files } from '$lib/stores/files';

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
  files.clearCache(); // Clear files cache on logout
}

// NEW: Get current auth state
export function getAuth(): AuthState {
  return get(store);
}

// NEW: Get token directly
export function getToken(): string | null {
  return get(store).token;
}

// NEW: Get user directly
export function getUser(): IUser | null {
  return get(store).user;
}

// NEW: Login function
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      setAuth(data.token, data.user);
      return { success: true };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/* Default store with helpful methods */
function createAuthStore() {
  const { subscribe, set, update } = store;

  return {
    subscribe,
    set,
    update,

    // Get current token
    getToken(): string | null {
      return getToken();
    },

    // Get current user
    getUser(): IUser | null {
      return getUser();
    },

    // Get full auth state
    getAuth(): AuthState {
      return getAuth();
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
      const state = get(store);
      return !!state.token && !!state.user;
    },

    // Convenience login method
    async login(email: string, password: string) {
      return await login(email, password);
    },

    // Reset/Logout
    reset() {
      clearAuth();
    }
  };
}

export const auth = createAuthStore();

// Auto-load auth on store initialization
if (browser) {
  loadAuth();
}