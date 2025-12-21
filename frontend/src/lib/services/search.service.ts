import { searchQuery, searchResults, isSearching, type SearchResult } from '$lib/stores/search';

export class GlobalSearchService {
    private static instance: GlobalSearchService;
    private searchTimeout: NodeJS.Timeout | null = null;

    private constructor() {}

    static getInstance(): GlobalSearchService {
        if (!GlobalSearchService.instance) {
            GlobalSearchService.instance = new GlobalSearchService();
        }
        return GlobalSearchService.instance;
    }

    async search(query: string): Promise<SearchResult[]> {
        if (!query.trim()) {
            searchResults.set([]);
            return [];
        }

        isSearching.set(true);

        try {
            // Make API call to search across all files
            const response = await fetch(`/api/search/global?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const results: SearchResult[] = await response.json();
            searchResults.set(results);
            isSearching.set(false);

            return results;
        } catch (error) {
            console.error('Search error:', error);
            isSearching.set(false);
            searchResults.set([]);
            return [];
        }
    }

    async searchDebounced(query: string, delay: number = 300): Promise<void> {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set new timeout
        this.searchTimeout = setTimeout(async () => {
            await this.search(query);
        }, delay);
    }

    async searchByType(query: string, type: 'all' | 'files' | 'folders' | 'shared' = 'all'): Promise<SearchResult[]> {
        const response = await fetch(`/api/search/global?q=${encodeURIComponent(query)}&type=${type}`);
        return response.json();
    }

    async getRecentFiles(limit: number = 10): Promise<SearchResult[]> {
        const response = await fetch(`/api/files/recent?limit=${limit}`);
        return response.json();
    }

    async getSharedFiles(): Promise<SearchResult[]> {
        const response = await fetch('/api/files/shared');
        return response.json();
    }
}