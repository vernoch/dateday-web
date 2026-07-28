import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useCouple } from '../context/CoupleContext'
import { Modal } from '../components/Modal'
import { LinkPreview } from '../components/LinkPreview'
import { IdeaForm } from '../components/IdeaForm'
import { newIdeaDraft } from '../lib/coupleApi'
import {
  CATEGORY_EMOJI,
  IDEA_CATEGORIES,
  IDEA_STATUSES,
  type IdeaCategory,
  type IdeaStatus,
} from '../lib/types'

export function IdeasPage() {
  const { ideas, deleteIdea, saveIdea } = useCouple()
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
    <div className="px-5 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nápady</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-love text-white"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {(['Vše', ...IDEA_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              category === c ? 'bg-love text-white' : 'bg-white text-muted'
            }`}
          >
            {c === 'Vše' ? 'Vše' : `${CATEGORY_EMOJI[c]} ${c}`}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(['Vše', ...IDEA_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${
              status === s ? 'bg-love-dark text-white' : 'bg-white/80 text-muted'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted">Žádné nápady v tomto filtru.</p>
        )}
        {filtered.map((idea) => (
          <div key={idea.id} className="card p-4">
            <button className="w-full text-left" onClick={() => setEditId(idea.id)}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">
                  {CATEGORY_EMOJI[idea.category]} {idea.title}
                </p>
                <span className="rounded-full bg-love-soft/60 px-2 py-0.5 text-[11px] text-love-dark">
                  {idea.status}
                </span>
              </div>
              {idea.notes && (
                <p className="mt-1 line-clamp-2 text-sm text-muted">{idea.notes}</p>
              )}
            </button>
            {idea.link?.trim() && <LinkPreview url={idea.link} className="mt-3" />}
            <div className="mt-3 flex flex-wrap gap-2">
              {IDEA_STATUSES.map((s) => (
                <button
                  key={s}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                    idea.status === s ? 'bg-love text-white' : 'bg-black/5 text-muted'
                  }`}
                  onClick={() => saveIdea({ ...idea, status: s })}
                >
                  {s}
                </button>
              ))}
              <button
                className="ml-auto text-[11px] text-red-600"
                onClick={async () => {
                  if (confirm('Smazat nápad?')) await deleteIdea(idea.id)
                }}
              >
                Smazat
              </button>
            </div>
          </div>
        ))}
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
