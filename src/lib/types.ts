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
  link: string
  imageUrl?: string
  /** Cached Open Graph image from link (optional; older events may omit). */
  previewImageUrl?: string
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

export type InviteStatus = 'pending' | 'accepted' | 'declined'

export interface DateInvitation {
  id: string
  status: InviteStatus
  senderDeviceId: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  plan: string
  food: string
  createdAt: string
  updatedAt: string
  respondedAt?: string
  eventId?: string
}

export interface InviteDraft {
  date: string
  time: string
  plan: string
  food: string
}

export const CATEGORY_EMOJI: Record<IdeaCategory, string> = {
  Restaurace: '🍽️',
  Filmy: '🎬',
  Výlety: '🏔️',
  Tripy: '✈️',
  Ostatní: '💜',
}
