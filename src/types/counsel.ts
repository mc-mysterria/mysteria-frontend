export type SuggestionStatus = 'PROPOSED' | 'ACCEPTED' | 'REJECTED'
export type Language = 'EN' | 'UK'

export interface CounselSuggestionPreview {
  id: number
  title: string
  slug: string
  language: Language
  suggesterName: string
  suggestionDate: string
  imageUrl?: string
  status: SuggestionStatus
  votesFor?: number
  votesAgainst?: number
  publishedAt?: string
}

export interface CounselSuggestion extends CounselSuggestionPreview {
  description: string
  renderedDescription: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}
