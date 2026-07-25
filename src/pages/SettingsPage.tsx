import { useState } from 'react'
import { Check, Copy, Heart } from 'lucide-react'
import { useCouple } from '../context/CoupleContext'

export function SettingsPage() {
  const { code, status, cloudReady, create, join, leave, error } = useCouple()
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function onCreate() {
    setBusy(true)
    setMsg(null)
    try {
      const c = await create()
      setMsg(`Kód páru: ${c}. Pošli ho partnerce.`)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Nepovedlo se vytvořit pár.')
    } finally {
      setBusy(false)
    }
  }

  async function onJoin() {
    setBusy(true)
    setMsg(null)
    try {
      await join(joinCode)
      setMsg('Připojeno. Data se budou sdílet.')
      setJoinCode('')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Nepovedlo se připojit.')
    } finally {
      setBusy(false)
    }
  }

  async function copyCode() {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="px-5 pt-8">
      <h1 className="mb-6 text-2xl font-bold">Nastavení</h1>

      <div className="card mb-4 flex items-start gap-3 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-love-soft text-love">
          <Heart className="h-5 w-5 fill-current" />
        </div>
        <div>
          <p className="font-semibold">{code ? `Pár ${code}` : 'Bez páru'}</p>
          <p className="text-sm text-muted">{status}</p>
          {!cloudReady && (
            <p className="mt-2 text-sm text-amber-700">
              Firebase zatím není nastavené — appka běží lokálně. Pro sdílení na dálku
              doplň `.env` podle README.
            </p>
          )}
        </div>
      </div>

      {code && (
        <div className="card mb-4 p-4">
          <p className="mb-2 text-sm text-muted">Váš kód páru</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold tracking-[0.2em] text-love-dark">{code}</p>
            <button onClick={copyCode} className="rounded-full bg-black/5 p-2">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button onClick={leave} className="btn-secondary mt-4 w-full text-sm">
            Odpojit pár
          </button>
        </div>
      )}

      {!code && (
        <div className="space-y-3">
          <button disabled={busy} onClick={onCreate} className="btn-primary w-full">
            Vytvořit pár
          </button>
          <div className="card space-y-3 p-4">
            <p className="text-sm font-medium">Mám kód od partnera</p>
            <input
              className="field tracking-widest uppercase"
              placeholder="např. AB12CD"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button disabled={busy || !joinCode.trim()} onClick={onJoin} className="btn-secondary w-full">
              Připojit se
            </button>
          </div>
        </div>
      )}

      {(msg || error) && (
        <p className="mt-4 text-sm text-muted">{msg || error}</p>
      )}

      <div className="mt-8 space-y-1 text-sm text-muted">
        <p>DateDay Web · 1.0</p>
        <p>Přidej na plochu: Safari → Sdílet → Na plochu</p>
      </div>
    </div>
  )
}
