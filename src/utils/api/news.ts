import { BaseCRUD, type APIResponse } from "./base";
import type { NewsArticle, NewsPreview, CreateNewsData, UpdateNewsData, Page } from "@/types/news";

class NewsAPI extends BaseCRUD<NewsArticle, CreateNewsData, UpdateNewsData, Record<string, never>> {
  constructor() {
    super("/news");
  }

  async getLatest(language: 'en' | 'uk'): Promise<APIResponse<NewsPreview[]>> {
    return this.request<NewsPreview[]>("GET", `/${language}/latest`);
  }

  async getBySlug(language: 'en' | 'uk', slug: string): Promise<APIResponse<NewsArticle>> {
    return this.request<NewsArticle>("GET", `/${language}/article/${slug}`);
  }

  async getAllAdmin(params?: { page?: number; size?: number }): Promise<APIResponse<Page<NewsArticle>>> {
    return this.request<Page<NewsArticle>>("GET", "/admin", { params });
  }

  async getByIdAdmin(id: number): Promise<APIResponse<NewsArticle>> {
    return this.request<NewsArticle>("GET", `/admin/${id}`);
  }

  async getBySlugAdmin(language: 'EN' | 'UK', slug: string): Promise<APIResponse<NewsArticle>> {
    return this.request<NewsArticle>("GET", `/admin/${language}/article/${slug}`);
  }

  async getPublished(language: 'EN' | 'UK', params?: { page?: number; size?: number }): Promise<APIResponse<Page<NewsPreview>>> {
    return this.request<Page<NewsPreview>>("GET", `/${language}`, { params });
  }

  override async create(data: CreateNewsData): Promise<APIResponse<NewsArticle>> {
    return this.request<NewsArticle>("POST", "", { body: data });
  }

  override async update(id: string, data: UpdateNewsData): Promise<APIResponse<NewsArticle>> {
    return this.request<NewsArticle>("PUT", `/${id}`, { body: data });
  }

  override async delete(id: string): Promise<APIResponse<NewsArticle>> {
    return this.request<NewsArticle>("DELETE", `/${id}`);
  }

  override async get(id: string): Promise<APIResponse<NewsArticle>> {
    return this.getByIdAdmin(parseInt(id));
  }
}

export const newsAPI = new NewsAPI();
