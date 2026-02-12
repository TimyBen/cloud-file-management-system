import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { files } from '$lib/stores/files';
import type { File } from '$lib/stores/files';

export type { File as SearchResult };
export type { File };

// --- UI State (global) ---
export const searchQuery = writable<string>('');
export const showSearchResults = writable<boolean>(false); // dropdown open/close
export const activeResultIndex = writable<number>(-1);
export const isSearching = writable<boolean>(false);

// --- Results ---
export const filteredFiles = writable<File[]>([]);

// For folder grouping (works once you have relative_path/path on files)
export type FolderResult = { folder: string; count: number };
export const folderResults = writable<FolderResult[]>([]);

// Files list from your files store
export const allFiles = derived(files, ($files) => $files.files);

// Derived helpers
export const hasSearchResults = derived(filteredFiles, ($r) => $r.length > 0);
export const totalResults = derived(filteredFiles, ($r) => $r.length);

// Optional: a single combined list for keyboard navigation
export type DropdownItem =
  | { kind: 'folder'; label: string; folder: string; count: number }
  | { kind: 'file'; label: string; file: File };

export const dropdownItems = derived(
  [folderResults, filteredFiles],
  ([$folders, $files]) => {
    const f1: DropdownItem[] = $folders.map((f) => ({
      kind: 'folder',
      label: f.folder,
      folder: f.folder,
      count: f.count
    }));

    const f2: DropdownItem[] = $files.map((file) => ({
      kind: 'file',
      label: file.filename,
      file
    }));

    return [...f1, ...f2];
  }
);

// --- Persistence ---
if (browser) {
  const saved = localStorage.getItem('cloudstore-search-query');
  if (saved) {
    try {
      searchQuery.set(JSON.parse(saved));
    } catch {}
  }
}

searchQuery.subscribe((query) => {
  if (browser) localStorage.setItem('cloudstore-search-query', JSON.stringify(query));
});

// --- Helpers ---
function safeLower(v: any) {
  return (typeof v === 'string' ? v : '').toLowerCase();
}

function fileDateValue(f: any) {
  // Support multiple possible field names
  const d =
    f?.upload_date ||
    f?.uploaded_at ||
    f?.created_at ||
    f?.updated_at ||
    null;
  const t = d ? new Date(d).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
}

function getFileType(f: any) {
  return f?.file_type || f?.mime_type || f?.mimeType || '';
}

function getPath(f: any) {
  // IMPORTANT: when you implement folder uploads, send/store relative_path
  return f?.relative_path || f?.folder_path || f?.path || '';
}

function buildFolderResults(list: File[], searchTerm: string): FolderResult[] {
  // Folder is derived from relative_path: "folder1/folder2/file.ext" => "folder1/folder2"
  const map = new Map<string, number>();

  for (const f of list) {
    const p = getPath(f);
    if (!p) continue;

    const folder = p.includes('/') ? p.split('/').slice(0, -1).join('/') : '';
    if (!folder) continue;

    // Only show folder groups relevant to query
    if (searchTerm && !safeLower(folder).includes(searchTerm) && !safeLower(f.filename).includes(searchTerm)) {
      continue;
    }

    map.set(folder, (map.get(folder) || 0) + 1);
  }

  return [...map.entries()]
    .map(([folder, count]) => ({ folder, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

// --- Core search ---
export function performSearch(query: string): File[] {
  const q = query.trim();
  if (!q) {
    filteredFiles.set([]);
    folderResults.set([]);
    showSearchResults.set(false);
    activeResultIndex.set(-1);
    return [];
  }

  isSearching.set(true);
  showSearchResults.set(true);

  const currentFiles = get(allFiles) || [];
  const searchTerm = q.toLowerCase();

  const results = currentFiles.filter((file: any) => {
    const name = safeLower(file?.filename);
    const type = safeLower(getFileType(file));
    const shareUrl = safeLower(file?.share_url);
    const path = safeLower(getPath(file));

    if (name.includes(searchTerm)) return true;
    if (type.includes(searchTerm)) return true;
    if (path.includes(searchTerm)) return true;
    if (searchTerm === 'shared' && !!file?.shared) return true;
    if (shareUrl.includes(searchTerm)) return true;

    return false;
  });

  results.sort((a: any, b: any) => {
    const aName = safeLower(a?.filename).includes(searchTerm);
    const bName = safeLower(b?.filename).includes(searchTerm);
    if (aName && !bName) return -1;
    if (!aName && bName) return 1;
    return fileDateValue(b) - fileDateValue(a);
  });

  filteredFiles.set(results);
  folderResults.set(buildFolderResults(results, searchTerm));
  isSearching.set(false);

  // reset keyboard selection
  activeResultIndex.set(-1);

  if (q) addToSearchHistory(q, results.length);

  return results;
}

let searchTimeout: any = null;
export function performSearchDebounced(query: string, delay = 250): void {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(query), delay);
}

export function openSearchDropdown() {
  showSearchResults.set(true);
}

export function closeSearchDropdown() {
  showSearchResults.set(false);
  activeResultIndex.set(-1);
}

export function clearSearch() {
  searchQuery.set('');
  filteredFiles.set([]);
  folderResults.set([]);
  showSearchResults.set(false);
  activeResultIndex.set(-1);
  isSearching.set(false);
}

// Keyboard navigation over dropdownItems
export function navigateResults(direction: 'up' | 'down') {
  const items = get(dropdownItems);
  if (!items.length) return;

  const current = get(activeResultIndex);
  let next = current;

  if (direction === 'down') next = current < items.length - 1 ? current + 1 : 0;
  if (direction === 'up') next = current > 0 ? current - 1 : items.length - 1;

  activeResultIndex.set(next);
}

// Select active item (navbar can call this on Enter)
export function getActiveItem(): DropdownItem | null {
  const items = get(dropdownItems);
  const idx = get(activeResultIndex);
  if (idx < 0 || idx >= items.length) return null;
  return items[idx];
}

// --- Search history ---
export function addToSearchHistory(query: string, resultCount: number) {
  if (!browser) return;
  const history = JSON.parse(localStorage.getItem('cloudstore-search-history') || '[]');
  const entry = { query, timestamp: new Date().toISOString(), resultCount };

  const filtered = history.filter((h: any) => h.query !== query);
  filtered.unshift(entry);
  if (filtered.length > 10) filtered.pop();

  localStorage.setItem('cloudstore-search-history', JSON.stringify(filtered));
}

export function getSearchHistory(): Array<{ query: string; timestamp: string; resultCount: number }> {
  if (!browser) return [];
  try {
    return JSON.parse(localStorage.getItem('cloudstore-search-history') || '[]');
  } catch {
    return [];
  }
}

export function clearSearchHistory() {
  if (!browser) return;
  localStorage.removeItem('cloudstore-search-history');
}

// Re-run search when files change
if (browser) {
  allFiles.subscribe(() => {
    const q = get(searchQuery);
    if (q.trim()) performSearchDebounced(q, 100);
  });
}
