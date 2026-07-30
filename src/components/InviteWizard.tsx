import { useState } from 'react'
import { ArrowLeft, ArrowRight, Heart, X } from 'lucide-react'
import { useCouple } from '../context/CoupleContext'
import {
  defaultInviteDate,
  INVITE_FOODS,
  INVITE_PLANS,
  INVITE_TIMES,
} from '../lib/inviteOptions'
import type { InviteDraft } from '../lib/types'

interface InviteWizardProps {
  onClose: () => void
  onSent: () => void
}

export function InviteWizard({ onClose, onSent }: InviteWizardProps) {
  const { sendInvitation } = useCouple()
  const [step, setStep] = useState<1 | 2>(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<InviteDraft>({
    date: defaultInviteDate(),
    time: '18:00',
    plan: INVITE_PLANS[2].label,
    food: '',
  })

  async function handleSend() {
    if (!draft.food) {
      setError('Vyber jídlo.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await sendInvitation(draft)
      onSent()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Odeslání selhalo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3">
        <button type="button" onClick={onClose} className="rounded-full p-2 text-muted" aria-label="Zavřít">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-love text-love" />
          <span className="text-[17px] font-bold">DateDay</span>
        </div>
        <div className="w-9" />
      </header>

      <div className="hero-gradient mx-4 mt-4 flex h-36 items-end rounded-[1.5rem] p-5 shadow-lg shadow-indigo-900/15">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wide text-white/80">Pozvánka</p>
          <h1 className="text-[26px] font-bold leading-tight text-white">Naplánuj rande</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {step === 1 ? (
          <>
            <p className="mb-4 text-[14px] text-muted">Krok 1 — datum, čas a plán</p>
            <label className="mb-1 block text-[13px] font-semibold text-muted">DATE</label>
            <input
              type="date"
              className="field mb-4"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
            <label className="mb-1 block text-[13px] font-semibold text-muted">TIME</label>
            <select
              className="field mb-4"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
            >
              {INVITE_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label className="mb-2 block text-[13px] font-semibold text-muted">THE PLAN</label>
            <div className="grid grid-cols-2 gap-2">
              {INVITE_PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, plan: p.label })}
                  className={`rounded-2xl border px-3 py-3 text-left text-[14px] font-semibold transition ${
                    draft.plan === p.label
                      ? 'border-love bg-love-soft text-love'
                      : 'border-black/[0.08] bg-chip'
                  }`}
                >
                  <span className="mr-1">{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-[14px] text-muted">Krok 2 — co sníme?</p>
            <h2 className="mb-4 text-[22px] font-bold">What should we eat?</h2>
            <div className="grid grid-cols-3 gap-2">
              {INVITE_FOODS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, food: f.label })}
                  className={`flex flex-col items-center rounded-2xl border px-2 py-4 text-center transition ${
                    draft.food === f.label
                      ? 'border-love bg-love-soft'
                      : 'border-black/[0.08] bg-chip'
                  }`}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="mt-1 text-[12px] font-semibold leading-tight">{f.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {error && <p className="mt-4 text-[14px] text-red-600">{error}</p>}
      </div>

      <div className="flex gap-3 border-t border-black/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="btn-secondary flex flex-1 items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Zpět
          </button>
        ) : (
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Zrušit
          </button>
        )}
        {step === 1 ? (
          <button
            type="button"
            onClick={() => setStep(2)}
            className="btn-primary flex flex-1 items-center justify-center gap-2"
          >
            Další: jídlo <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={handleSend} className="btn-primary flex-1">
            {busy ? 'Odesílám…' : "Odeslat pozvánku 💖"}
          </button>
        )}
      </div>
    </div>
  )
}
