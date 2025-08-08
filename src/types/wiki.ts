export interface WikiCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface WikiPage {
  id: number;
  name: string;
  slug: string;
  language: 'EN' | 'UK';
  category: WikiCategory;
  content: string;
  renderedContent?: string;
  isPublished: boolean;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface WikiPagePreview {
  id: number;
  name: string;
  slug: string;
  category: WikiCategory;
  language: 'EN' | 'UK';
  viewCount: number;
  updatedAt: string;
}

export interface CreateWikiPageData {
  name: string;
  slug: string;
  categoryId: number;
  language: 'EN' | 'UK';
  content: string;
  isPublished?: boolean;
}

export interface UpdateWikiPageData {
  name?: string;
  slug?: string;
  categoryId?: number;
  content?: string;
  isPublished?: boolean;
}

export interface CreateWikiCategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
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
