import type { IdeaCategory, IdeaStatus } from './types'
import {
  Film,
  Heart,
  Mountain,
  Plane,
  LayoutGrid,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

export type CategoryStyle = {
  bg: string
  fg: string
  soft: string
  Icon: LucideIcon
}

export const CATEGORY_STYLE: Record<IdeaCategory, CategoryStyle> = {
  Restaurace: {
    bg: '#ffedd5',
    fg: '#ea580c',
    soft: '#fff7ed',
    Icon: UtensilsCrossed,
  },
  Filmy: {
    bg: '#f3e8ff',
    fg: '#9333ea',
    soft: '#faf5ff',
    Icon: Film,
  },
  Výlety: {
    bg: '#dcfce7',
    fg: '#16a34a',
    soft: '#f0fdf4',
    Icon: Mountain,
  },
  Tripy: {
    bg: '#dbeafe',
    fg: '#2563eb',
    soft: '#eff6ff',
    Icon: Plane,
  },
  Ostatní: {
    bg: '#ffe4e6',
    fg: '#e11d48',
    soft: '#fff1f2',
    Icon: Heart,
  },
}

export const ALL_CATEGORY_STYLE: CategoryStyle = {
  bg: '#ff3b5c',
  fg: '#ffffff',
  soft: '#ffe0e6',
  Icon: LayoutGrid,
}

export const STATUS_STYLE: Record<IdeaStatus, { bg: string; fg: string }> = {
  Wishlist: { bg: '#f97316', fg: '#ffffff' },
  Plánujeme: { bg: '#3b82f6', fg: '#ffffff' },
  Splněno: { bg: '#22c55e', fg: '#ffffff' },
}

export function napaduLabel(count: number): string {
  if (count === 1) return '1 nápad'
  if (count >= 2 && count <= 4) return `${count} nápady`
  return `${count} nápadů`
}
