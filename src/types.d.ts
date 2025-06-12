// Type definitions for mcp-deep-search

export interface SearchOptions {
    query: string;
    provider?: string;
    maxResults?: number;
    includeAnswer?: boolean;
}

export interface SearchResult {
    title: string;
    link: string;
    snippet?: string;
    [key: string]: any;
}

export interface SearchResponse {
    provider?: string;
    answer?: string;
    results?: SearchResult[];
    [key: string]: any;
}
