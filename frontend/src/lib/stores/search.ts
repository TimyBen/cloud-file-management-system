import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { files } from '$lib/stores/files'; // Import your existing files store
import type { File } from '$lib/stores/files'; // Import the File type

// Re-export the File interface for consistency
export type { File as SearchResult };
export type { File };

// Search state
export const searchQuery = writable<string>('');
export const filteredFiles = writable<File[]>([]);
export const showSearchResults = writable<boolean>(false);
export const activeResultIndex = writable<number>(-1);
export const isSearching = writable<boolean>(false);

// Derived from your existing files store
export const allFiles = derived(
  files,
  $files => $files.files
);

// Derived stores
export const hasSearchResults = derived(
  filteredFiles,
  $filteredFiles => $filteredFiles.length > 0
);

export const totalResults = derived(
  filteredFiles,
  $filteredFiles => $filteredFiles.length
);

// Initialize from localStorage
if (browser) {
  const saved = localStorage.getItem('cloudstore-search-query');
  if (saved) {
    try {
      searchQuery.set(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load search query:', e);
    }
  }
}

// Save search query to localStorage
searchQuery.subscribe((query) => {
  if (browser) {
    localStorage.setItem('cloudstore-search-query', JSON.stringify(query));
  }
});

// Client-side search function (uses your existing files store)
export function performSearch(query: string): File[] {
  if (!query.trim()) {
    filteredFiles.set([]);
    showSearchResults.set(false);
    return [];
  }

  isSearching.set(true);
  showSearchResults.set(true);

  const currentFiles = get(allFiles);
  const searchTerm = query.toLowerCase().trim();

  // Perform client-side search on cached files
  const results = currentFiles.filter(file => {
    // Search in filename (highest priority)
    if (file.filename.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in mimeType
    if (file.mime_type?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Search in shared status
    if (searchTerm === 'shared' && file.shared) {
      return true;
    }

    // Search in share URL
    if (file.share_url?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    return false;
  });

  // Sort results: by relevance (filename match first), then by upload date
  const sortedResults = results.sort((a, b) => {
    const aNameMatch = a.filename.toLowerCase().includes(searchTerm);
    const bNameMatch = b.filename.toLowerCase().includes(searchTerm);

    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;

    // Sort by most recent upload
    return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
  });

  filteredFiles.set(sortedResults);
  isSearching.set(false);

  // Add to search history
  if (query.trim()) {
    addToSearchHistory(query, sortedResults.length);
  }

  return sortedResults;
}

// Debounced search for real-time filtering
let searchTimeout: NodeJS.Timeout | null = null;
export function performSearchDebounced(query: string, delay: number = 300): void {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    performSearch(query);
  }, delay);
}

// Clear search
export function clearSearch() {
  searchQuery.set('');
  filteredFiles.set([]);
  showSearchResults.set(false);
  activeResultIndex.set(-1);
  isSearching.set(false);
}

// Navigate to search result
export function navigateToResult(result: File) {
  // Handle file navigation - adjust based on your app's routing
  if (result.mime_type?.startsWith('image/')) {
    // Open image in preview
    window.open(`/files/preview/${result.id}`, '_blank');
  } else if (result.shared && result.share_url) {
    // Open share URL
    window.open(result.share_url, '_blank');
  } else {
    // Navigate to file details
    window.location.href = `/files/${result.id}`;
  }

  clearSearch();
}

// Keyboard navigation
export function navigateResults(direction: 'up' | 'down'): void {
  const results = get(filteredFiles);
  const currentIndex = get(activeResultIndex);

  if (results.length === 0) return;

  let newIndex = currentIndex;

  if (direction === 'down') {
    newIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
  } else if (direction === 'up') {
    newIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
  }

  activeResultIndex.set(newIndex);

  // Scroll into view
  if (browser) {
    setTimeout(() => {
      const element = document.querySelector(`[data-result-index="${newIndex}"]`);
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }, 10);
  }
}

// Search history management
export function addToSearchHistory(query: string, resultCount: number) {
  if (!browser) return;

  const history = JSON.parse(localStorage.getItem('cloudstore-search-history') || '[]');
  const newEntry = {
    query,
    timestamp: new Date().toISOString(),
    resultCount
  };

  // Remove duplicates and keep last 10
  const filtered = history.filter((h: any) => h.query !== query);
  filtered.unshift(newEntry);

  if (filtered.length > 10) {
    filtered.pop();
  }

  localStorage.setItem('cloudstore-search-history', JSON.stringify(filtered));
}

export function getSearchHistory(): Array<{query: string; timestamp: string; resultCount: number}> {
  if (!browser) return [];

  try {
    return JSON.parse(localStorage.getItem('cloudstore-search-history') || '[]');
  } catch (e) {
    return [];
  }
}

export function clearSearchHistory(): void {
  if (!browser) return;
  localStorage.removeItem('cloudstore-search-history');
}

// Helper functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Watch for file changes and update search results
if (browser) {
  allFiles.subscribe(() => {
    const query = get(searchQuery);
    if (query.trim()) {
      // Re-run search when files change
      performSearchDebounced(query, 100);
    }
  });
}