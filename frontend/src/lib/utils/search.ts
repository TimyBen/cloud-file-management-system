// Search utility functions
export interface FileItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size?: number;
    modified: Date;
    tags?: string[];
    content?: string; // For text files
    owner?: string;
    sharedWith?: string[];
    mimeType?: string;
}

export function searchFiles(
    files: FileItem[],
    query: string,
    options: {
        searchInContent?: boolean;
        includeTags?: boolean;
        includeOwners?: boolean;
    } = {}
): FileItem[] {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();

    return files.filter(file => {
        // Search in filename
        if (file.name.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Search in tags
        if (options.includeTags && file.tags) {
            if (file.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
                return true;
            }
        }

        // Search in owner
        if (options.includeOwners && file.owner) {
            if (file.owner.toLowerCase().includes(searchTerm)) {
                return true;
            }
        }

        // Search in content (for text files)
        if (options.searchInContent && file.content) {
            if (file.content.toLowerCase().includes(searchTerm)) {
                return true;
            }
        }

        // Search in shared with users
        if (file.sharedWith) {
            if (file.sharedWith.some(user => user.toLowerCase().includes(searchTerm))) {
                return true;
            }
        }

        return false;
    });
}

// Debounce function for realtime search
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}