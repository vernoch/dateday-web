export type IdeaCategory =
  | 'Restaurace'
  | 'Filmy'
  | 'Výlety'
  | 'Tripy'
  | 'Ostatní'

export type IdeaStatus = 'Wishlist' | 'Plánujeme' | 'Splněno'

export interface DateEvent {
  id: string
  title: string
  date: string // ISO
  location: string
  notes: string
  imageUrl?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  title: string
  notes: string
  link: string
  category: IdeaCategory
  status: IdeaStatus
  createdAt: string
  updatedAt: string
}

export const IDEA_CATEGORIES: IdeaCategory[] = [
  'Restaurace',
  'Filmy',
  'Výlety',
  'Tripy',
  'Ostatní',
]

export const IDEA_STATUSES: IdeaStatus[] = ['Wishlist', 'Plánujeme', 'Splněno']

export const CATEGORY_EMOJI: Record<IdeaCategory, string> = {
  Restaurace: '🍽️',
  Filmy: '🎬',
  Výlety: '🏔️',
  Tripy: '✈️',
  Ostatní: '💜',
}
