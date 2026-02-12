import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface File {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  shared: boolean;
  share_url?: string;
}

interface FileStore {
  files: File[];
  lastUpdated: number;
  lastFetched: number;
  isLoading: boolean;
  error: string | null;
  version: number;
}

const CACHE_KEY = 'cloudstore_files_cache';
const CACHE_VERSION = 1;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function createFileStore() {
  const initial: FileStore = {
    files: [],
    lastUpdated: 0,
    lastFetched: 0,
    isLoading: false,
    error: null,
    version: CACHE_VERSION
  };

  const { subscribe, set, update } = writable<FileStore>(initial);

  // Initialize from localStorage
  if (browser) {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        const isExpired = Date.now() - parsed.lastFetched > CACHE_TTL;
        const isWrongVersion = parsed.version !== CACHE_VERSION;

        if (!isExpired && !isWrongVersion) {
          console.log('📁 Loading files from cache');
          set(parsed);
        } else {
          console.log('📁 Cache expired or wrong version, clearing');
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to load files from cache:', e);
      localStorage.removeItem(CACHE_KEY);
    }
  }

  const store = {
    subscribe,

    // Set files and cache them
    setFiles: (files: File[], forceUpdate = false) => {
      update(state => {
        const now = Date.now();
        const newState = {
          files,
          lastUpdated: now,
          lastFetched: now,
          isLoading: false,
          error: null,
          version: CACHE_VERSION
        };

        // ALWAYS cache when files are set (even empty array)
        if (browser) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
        }

        return newState;
      });
    },

    // Load files from API
    loadFiles: async (forceRefresh = false): Promise<File[]> => {
      // Don't load if cache is fresh (unless forcing refresh)
      if (!forceRefresh && store.isCacheFresh()) {
        console.log('📁 Using cached files');
        return get(store).files;
      }

      store.setLoading(true);
      store.setError(null);

      try {
        // Get auth token from localStorage
        let token = '';
        if (browser) {
          token = localStorage.getItem('auth.token') || '';
        }

        const response = await fetch('/api/files', {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch files: ${response.statusText}`);
        }

        const fetchedFiles: File[] = await response.json();
        store.setFiles(fetchedFiles);

        return fetchedFiles;
      } catch (error) {
        console.error('Failed to load files:', error);
        store.setError(error instanceof Error ? error.message : 'Unknown error');
        throw error;
      } finally {
        store.setLoading(false);
      }
    },

    // Add a single file
    addFile: (file: File) => {
      update(state => {
        const newFiles = [file, ...state.files];
        const newState = {
          files: newFiles,
          lastUpdated: Date.now(),
          lastFetched: state.lastFetched,
          isLoading: false,
          error: null,
          version: CACHE_VERSION
        };

        if (browser) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
        }

        return newState;
      });
    },

    // Remove a file
    removeFile: (fileId: string) => {
      update(state => {
        const newFiles = state.files.filter(f => f.id !== fileId);
        const newState = {
          files: newFiles,
          lastUpdated: Date.now(),
          lastFetched: state.lastFetched,
          isLoading: false,
          error: null,
          version: CACHE_VERSION
        };

        if (browser) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
        }

        return newState;
      });
    },

    // Update a file
    updateFile: (fileId: string, updates: Partial<File>) => {
      update(state => {
        const newFiles = state.files.map(f =>
          f.id === fileId ? { ...f, ...updates } : f
        );
        const newState = {
          files: newFiles,
          lastUpdated: Date.now(),
          lastFetched: state.lastFetched,
          isLoading: false,
          error: null,
          version: CACHE_VERSION
        };

        if (browser) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(newState));
        }

        return newState;
      });
    },

    // Check if cache is fresh (less than TTL)
    isCacheFresh: (): boolean => {
      if (!browser) return false;

      try {
        const saved = localStorage.getItem(CACHE_KEY);
        if (!saved) return false;

        const parsed = JSON.parse(saved);
        const isExpired = Date.now() - parsed.lastFetched > CACHE_TTL;
        const isWrongVersion = parsed.version !== CACHE_VERSION;

        return !isExpired && !isWrongVersion && parsed.files.length > 0;
      } catch {
        return false;
      }
    },

    // Get cache age in minutes
    getCacheAge: (): number => {
      if (!browser) return 0;

      try {
        const saved = localStorage.getItem(CACHE_KEY);
        if (!saved) return 0;

        const parsed = JSON.parse(saved);
        return Math.round((Date.now() - parsed.lastFetched) / 60000);
      } catch {
        return 0;
      }
    },

    // Clear cache
    clearCache: () => {
      set(initial);
      if (browser) {
        localStorage.removeItem(CACHE_KEY);
      }
    },

    // Set loading state
    setLoading: (loading: boolean) => {
      update(state => ({ ...state, isLoading: loading }));
    },

    // Set error
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },

    // Check if we need to fetch from API
    shouldFetch: (): boolean => {
      if (!browser) return true;

      try {
        const saved = localStorage.getItem(CACHE_KEY);
        if (!saved) return true;

        const parsed = JSON.parse(saved);
        const isExpired = Date.now() - parsed.lastFetched > CACHE_TTL;
        const isWrongVersion = parsed.version !== CACHE_VERSION;
        const isEmpty = parsed.files.length === 0;

        return isExpired || isWrongVersion || isEmpty;
      } catch {
        return true;
      }
    }
  };

  return store;
}

export const files = createFileStore();

// Derived stores
export const fileCount = derived(files, $files => $files.files.length);
export const totalSize = derived(files, $files =>
  $files.files.reduce((sum, file) => sum + (file.file_size || 0), 0)
);
export const sharedCount = derived(files, $files =>
  $files.files.filter(f => f.shared).length
);

// Search within files
export function searchFiles(query: string): File[] {
  const currentFiles = get(files).files;
  if (!query.trim()) return currentFiles;

  const searchTerm = query.toLowerCase().trim();

  return currentFiles.filter(file =>
    file.filename.toLowerCase().includes(searchTerm) ||
    file.mime_type?.toLowerCase().includes(searchTerm) ||
    (file.shared && searchTerm === 'shared') ||
    file.share_url?.toLowerCase().includes(searchTerm)
  );
}

// Get file by ID
export function getFileById(id: string): File | undefined {
  return get(files).files.find(f => f.id === id);
}

// Filter by type
export function filterByType(mimeType: string): File[] {
  return get(files).files.filter(f => f.mime_type?.includes(mimeType));
}