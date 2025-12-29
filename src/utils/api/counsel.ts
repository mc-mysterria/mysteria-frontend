import {type APIResponse, BaseCRUD} from './base'
import type {CounselSuggestion, CounselSuggestionPreview, Page} from '@/types/counsel'

// Type for creating a new counsel suggestion
export interface CreateCounselData {
    title: string
    slug: string
    language: 'EN' | 'UK'
    description: string
    suggesterName: string
    suggestionDate: string
    imageUrl?: string
    status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED'
    votesFor?: number
    votesAgainst?: number
    isPublished?: boolean
}

// Type for updating counsel suggestion
export interface UpdateCounselData {
    title?: string
    slug?: string
    description?: string
    suggesterName?: string
    suggestionDate?: string
    imageUrl?: string
    status?: 'PROPOSED' | 'ACCEPTED' | 'REJECTED'
    votesFor?: number
    votesAgainst?: number
    isPublished?: boolean
}

class CounselAPI extends BaseCRUD<CounselSuggestion, CreateCounselData, UpdateCounselData, never> {
    constructor() {
        super('/counsel')
    }

    // Public endpoints
    async getAll(language: 'en' | 'uk'): Promise<APIResponse<CounselSuggestionPreview[]>> {
        return this.request<CounselSuggestionPreview[]>('GET', `/${language}/all`)
    }

    async getBySlug(language: 'en' | 'uk', slug: string): Promise<APIResponse<CounselSuggestion>> {
        return this.request<CounselSuggestion>('GET', `/${language}/suggestion/${slug}`)
    }

    async getPaginated(
        language: 'en' | 'uk',
        params?: { page?: number; size?: number }
    ): Promise<APIResponse<Page<CounselSuggestionPreview>>> {
        return this.request<Page<CounselSuggestionPreview>>('GET', `/${language}`, {params})
    }

    // Admin endpoints (require PERM_UNMEETING:MANAGE permission)
    async getAllAdmin(params?: { page?: number; size?: number }): Promise<APIResponse<Page<CounselSuggestion>>> {
        return this.request<Page<CounselSuggestion>>('GET', '/admin', {params})
    }

    async getByIdAdmin(id: number): Promise<APIResponse<CounselSuggestion>> {
        return this.request<CounselSuggestion>('GET', `/admin/${id}`)
    }

    async getBySlugAdmin(language: 'en' | 'uk', slug: string): Promise<APIResponse<CounselSuggestion>> {
        return this.request<CounselSuggestion>('GET', `/admin/${language}/suggestion/${slug}`)
    }

}

export const counselAPI = new CounselAPI()
