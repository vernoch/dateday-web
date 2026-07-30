import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useCouple } from '../context/CoupleContext'
import { formatInviteDate } from '../lib/inviteUtils'
import type { DateInvitation } from '../lib/types'
import { RunawayNopeButton } from './RunawayNopeButton'

interface InviteAcceptFlowProps {
  invitation: DateInvitation
  onDone: () => void
}

export function InviteAcceptFlow({ invitation, onDone }: InviteAcceptFlowProps) {
  const { acceptInvitation, declineInvitation } = useCouple()
  const [step, setStep] = useState<'ask' | 'celebrate'>('ask')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleYes() {
    setBusy(true)
    setError(null)
    try {
      await acceptInvitation(invitation)
      setStep('celebrate')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nepodařilo se přijmout.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDecline() {
    setBusy(true)
    try {
      await declineInvitation(invitation)
      onDone()
    } catch {
      onDone()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <header className="flex items-center justify-center border-b border-black/[0.06] bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 fill-love text-love" />
          <span className="text-[20px] font-bold">DateDay</span>
        </div>
      </header>

      <div className="hero-gradient mx-4 mt-4 flex h-40 shrink-0 items-center justify-center rounded-[1.5rem] shadow-lg shadow-indigo-900/15">
        <span className="text-6xl">{step === 'ask' ? '🐱' : '🐶'}</span>
      </div>

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-8 text-center">
        {step === 'ask' ? (
          <>
            <p className="text-[14px] font-semibold uppercase tracking-wide text-love">Pozvánka</p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight">
              Přišla ti pozvánka —
              <br />
              půjdeš se mnou na rande?
            </h1>
            <p className="mt-3 text-[15px] text-muted">
              {formatInviteDate(invitation.date)} · {invitation.time}
              <br />
              {invitation.plan} · {invitation.food}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handleYes}
              className="btn-primary mt-8 min-w-[220px] px-8 py-4 text-[17px]"
            >
              {busy ? 'Moment…' : 'Ano, moc ráda 💖'}
            </button>
            <RunawayNopeButton onDecline={handleDecline} />
            {error && <p className="mt-4 text-[14px] text-red-600">{error}</p>}
          </>
        ) : (
          <>
            <h1 className="text-[32px] font-bold">Je to rande! 🎉</h1>
            <div className="mt-6 w-full max-w-sm rounded-[1.5rem] bg-chip p-5 text-left">
              <p className="text-[13px] font-semibold uppercase text-muted">Souhrn</p>
              <p className="mt-2 text-[18px] font-bold">{formatInviteDate(invitation.date)}</p>
              <p className="mt-1 text-[16px]">{invitation.time}</p>
              <p className="mt-3 text-[15px]">
                <span className="font-semibold">Plán:</span> {invitation.plan}
              </p>
              <p className="mt-1 text-[15px]">
                <span className="font-semibold">Jídlo:</span> {invitation.food}
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-love-soft px-5 py-4">
              <p className="text-[22px]">Best day ever</p>
              <p className="mt-2 text-[15px] text-muted">
                Vyzvednu tě v {invitation.time}. Už se nemůžu dočkat! 🥰
              </p>
            </div>
            <button type="button" onClick={onDone} className="btn-primary mt-8 min-w-[200px]">
              Hotovo
            </button>
          </>
        )}
      </div>
    </div>
  )
}
