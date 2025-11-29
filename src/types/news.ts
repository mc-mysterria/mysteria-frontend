export interface NewsArticle {
    id: number;
    title: string;
    slug: string;
    language: 'EN' | 'UK';
    shortDescription: string;
    preview: string;
    content: string;
    renderedContent?: string;
    isPublished: boolean;
    isPinned?: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface NewsPreview {
    id: number;
    title: string;
    slug: string;
    language: 'EN' | 'UK';
    shortDescription: string;
    preview: string;
    isPinned?: boolean;
    publishedAt: string;
}

export interface CreateNewsData {
    title: string;
    slug: string;
    language: 'EN' | 'UK';
    shortDescription?: string;
    preview?: string;
    content: string;
    isPublished?: boolean;
    isPinned?: boolean;
}

export interface UpdateNewsData {
    title?: string;
    slug?: string;
    shortDescription?: string;
    preview?: string;
    content?: string;
    isPublished?: boolean;
    isPinned?: boolean;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}
