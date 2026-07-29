import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Plus, Star } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useCouple } from '../context/CoupleContext'
import { Modal } from '../components/Modal'
import { IdeaForm } from '../components/IdeaForm'
import { newIdeaDraft } from '../lib/coupleApi'
import {
  IDEA_CATEGORIES,
  IDEA_STATUSES,
  type IdeaCategory,
  type IdeaStatus,
} from '../lib/types'
import {
  ALL_CATEGORY_STYLE,
  CATEGORY_STYLE,
  STATUS_STYLE,
} from '../lib/categoryStyles'

export function IdeasPage() {
  const { ideas } = useCouple()
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState<IdeaCategory | 'Vše'>('Vše')
  const [status, setStatus] = useState<IdeaStatus | 'Vše'>('Vše')
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const fromUrl = searchParams.get('category')
    if (fromUrl && IDEA_CATEGORIES.includes(fromUrl as IdeaCategory)) {
      setCategory(fromUrl as IdeaCategory)
    }
  }, [searchParams])

  const filtered = useMemo(() => {
    return ideas
      .filter((i) => category === 'Vše' || i.category === category)
      .filter((i) => status === 'Vše' || i.status === status)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  }, [ideas, category, status])

  const editIdea = ideas.find((i) => i.id === editId)

  return (
    <div className="px-5 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[34px] font-bold tracking-tight">Nápady</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-love shadow-md shadow-black/10"
          aria-label="Přidat nápad"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        {(['Vše', ...IDEA_CATEGORIES] as const).map((c) => {
          const active = category === c
          const style = c === 'Vše' ? ALL_CATEGORY_STYLE : CATEGORY_STYLE[c]
          const Icon = style.Icon
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-semibold transition"
              style={
                active
                  ? { backgroundColor: '#ff3b5c', color: '#fff' }
                  : { backgroundColor: style.bg, color: style.fg }
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              {c}
            </button>
          )
        })}
      </div>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {(['Vše', ...IDEA_STATUSES] as const).map((s) => {
          const active = status === s
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition ${
                active ? 'bg-ink text-white' : 'bg-chip text-ink'
              }`}
            >
              {s}
            </button>
          )
        })}
      </div>

      <div className="space-y-3 pb-4">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-[15px] text-muted">
            Žádné nápady v tomto filtru.
          </p>
        )}
        {filtered.map((idea) => {
          const catStyle = CATEGORY_STYLE[idea.category]
          const CatIcon = catStyle.Icon
          const statusStyle = STATUS_STYLE[idea.status]
          return (
            <button
              key={idea.id}
              type="button"
              onClick={() => setEditId(idea.id)}
              className="flex w-full items-center gap-3 rounded-[1.35rem] bg-chip p-3.5 text-left transition active:scale-[0.99]"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: catStyle.bg }}
              >
                <CatIcon className="h-5 w-5" style={{ color: catStyle.fg }} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-bold">{idea.title}</p>
                {idea.notes && (
                  <p className="mt-0.5 truncate text-[14px] text-muted">{idea.notes}</p>
                )}
                <p className="mt-0.5 text-[13px] font-medium" style={{ color: catStyle.fg }}>
                  {idea.category}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.fg }}
                >
                  {idea.status === 'Wishlist' && <Star className="h-3 w-3 fill-current" />}
                  {idea.status}
                </span>
                <ChevronRight className="h-5 w-5 text-muted/50" />
              </div>
            </button>
          )
        })}
      </div>

      {showAdd && (
        <Modal title="Nový nápad" onClose={() => setShowAdd(false)}>
          <IdeaForm initial={newIdeaDraft()} onDone={() => setShowAdd(false)} />
        </Modal>
      )}
      {editIdea && (
        <Modal title="Upravit nápad" onClose={() => setEditId(null)}>
          <IdeaForm initial={editIdea} onDone={() => setEditId(null)} />
        </Modal>
      )}
    </div>
  )
}
