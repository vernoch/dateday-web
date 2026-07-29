import { useState } from 'react'
import { CalendarPlus, Check, Copy, Download, Heart, Smartphone } from 'lucide-react'
import { useCouple } from '../context/CoupleContext'
import { getCalendarFeedPublicUrl } from '../lib/coupleApi'
import { APP_VERSION } from '../lib/firebase'
import { downloadCalendarIcs, toWebcalUrl } from '../lib/ics'

export function SettingsPage() {
  const {
    code,
    mode,
    status,
    cloudReady,
    events,
    create,
    join,
    leave,
    repairSync,
    refreshCalendarFeed,
    error,
  } = useCouple()
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedFeed, setCopiedFeed] = useState(false)

  const feedUrl = code && cloudReady && mode === 'cloud' ? getCalendarFeedPublicUrl(code) : null

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

  async function onRepairSync() {
    setBusy(true)
    setMsg(null)
    try {
      await repairSync()
      setMsg('Synchronizace obnovena. Zkus přidat nebo upravit rande.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Obnovení synchronizace selhalo.')
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

  async function openAppleCalendar() {
    setBusy(true)
    setMsg(null)
    try {
      await refreshCalendarFeed()
      const url = feedUrl || (code ? getCalendarFeedPublicUrl(code) : null)
      if (!url) throw new Error('Kalendářový odkaz není dostupný.')
      window.location.href = toWebcalUrl(url)
      setMsg('Otevři Apple Kalendář a potvrď odběr. Změny se propsají při další aktualizaci (ne hned).')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Nepovedlo se připravit kalendář.')
    } finally {
      setBusy(false)
    }
  }

  async function copyFeedLink() {
    setBusy(true)
    setMsg(null)
    try {
      await refreshCalendarFeed()
      const url = feedUrl || (code ? getCalendarFeedPublicUrl(code) : null)
      if (!url) throw new Error('Kalendářový odkaz není dostupný.')
      await navigator.clipboard.writeText(url)
      setCopiedFeed(true)
      setTimeout(() => setCopiedFeed(false), 1500)
      setMsg('Odkaz zkopírován. Na druhém iPhonu: Nastavení → Kalendář → Účty → Přidat odběr kalendáře.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Kopírování selhalo.')
    } finally {
      setBusy(false)
    }
  }

  function exportLocalIcs() {
    downloadCalendarIcs(events, 'DateDay.ics')
    setMsg('Soubor DateDay.ics stažen — otevři ho a přidej do Apple Kalendáře.')
  }

  return (
    <div className="min-h-full bg-surface px-5 pt-6 pb-4">
      <h1 className="mb-6 text-[34px] font-bold tracking-tight">Nastavení</h1>

      <p className="mb-2 px-1 text-[13px] font-semibold text-muted">Stav</p>
      <div className="settings-card mb-5 flex items-start gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chip text-muted">
          {code ? (
            <Heart className="h-5 w-5 fill-love text-love" />
          ) : (
            <Smartphone className="h-5 w-5" strokeWidth={1.8} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[16px] font-semibold">
            {code ? `Pár ${code}` : 'Appka běží lokálně'}
          </p>
          <p className="mt-0.5 text-[14px] leading-snug text-muted">
            {code
              ? status
              : 'Propojte se kódem páru, až budete chtít sdílet data mezi telefony.'}
          </p>
          {!cloudReady && (
            <p className="mt-2 text-[13px] text-amber-700">
              Stará verze appky nebo chybí cloud. Obnov stránku a zkus „Obnovit synchronizaci“.
            </p>
          )}
          {cloudReady && mode === 'cloud' && (
            <p className="mt-2 text-[13px] text-green-700">
              Data se synchronizují mezi zařízeními se stejným kódem páru.
            </p>
          )}
        </div>
      </div>

      <p className="mb-2 px-1 text-[13px] font-semibold text-muted">Sdílení pro dva</p>
      <div className="settings-card mb-5">
        {code ? (
          <div className="p-4">
            <p className="mb-2 text-[14px] text-muted">Váš kód páru</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold tracking-[0.2em] text-love">{code}</p>
              <button
                onClick={copyCode}
                className="rounded-full bg-chip p-2"
                aria-label="Kopírovat kód"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <button onClick={leave} className="btn-secondary mt-4 w-full text-sm">
              Odpojit pár
            </button>
            {cloudReady && (
              <button
                disabled={busy}
                onClick={onRepairSync}
                className="btn-secondary mt-2 w-full text-sm"
              >
                Obnovit synchronizaci
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="px-4 pt-4 text-[14px] leading-relaxed text-muted">
              Vytvořte pár a pošlete kód partnerce. Rande i nápady se budou sdílet v cloudu mezi
              oběma telefony.
            </p>
            <div className="mt-3 border-t border-black/[0.06] px-4 py-3">
              <button
                disabled={busy}
                onClick={onCreate}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-love text-white">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
                <span className="text-[16px] font-semibold text-love">Vytvořit pár</span>
              </button>
            </div>
            <div className="border-t border-black/[0.06] space-y-3 p-4">
              <p className="text-[14px] font-medium">Mám kód od partnera</p>
              <input
                className="field tracking-widest uppercase"
                placeholder="např. AB12CD"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button
                disabled={busy || !joinCode.trim()}
                onClick={onJoin}
                className="btn-secondary w-full"
              >
                Připojit se
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mb-2 px-1 text-[13px] font-semibold text-muted">Apple Kalendář</p>
      <div className="settings-card mb-5">
        {code && cloudReady && mode === 'cloud' ? (
          <div>
            <p className="px-4 pt-4 text-[14px] leading-relaxed text-muted">
              Jednou přidej odběr DateDay do Apple Kalendáře. Nová a upravená rande se tam objeví
              při další aktualizaci odběru (ne okamžitě).
            </p>
            <div className="mt-3 border-t border-black/[0.06] px-4 py-3">
              <button
                disabled={busy}
                onClick={openAppleCalendar}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-love text-white">
                  <CalendarPlus className="h-4 w-4" />
                </div>
                <span className="text-[16px] font-semibold text-love">Přidat do Apple Kalendáře</span>
              </button>
            </div>
            <div className="border-t border-black/[0.06] px-4 py-3">
              <button
                disabled={busy}
                onClick={copyFeedLink}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chip text-ink">
                  {copiedFeed ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </div>
                <span className="text-[16px] font-semibold">Kopírovat odkaz odběru</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-[14px] leading-relaxed text-muted">
              {code
                ? 'Pro živý odběr potřebuješ cloud sync. Mezitím můžeš stáhnout všechna rande jako soubor.'
                : 'Bez páru můžeš stáhnout aktuální rande jako .ics a jednorázově je přidat do Kalendáře.'}
            </p>
            <button
              type="button"
              onClick={exportLocalIcs}
              className="btn-secondary mt-3 flex w-full items-center justify-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Stáhnout DateDay.ics
            </button>
          </div>
        )}
      </div>

      {(msg || error) && (
        <p className={`mb-5 text-[14px] ${error ? 'text-red-600' : 'text-muted'}`}>
          {msg || error}
        </p>
      )}

      <p className="mb-2 px-1 text-[13px] font-semibold text-muted">Aplikace</p>
      <div className="settings-card">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[16px] font-semibold">Verze</span>
          <span className="text-[15px] text-muted">{APP_VERSION}</span>
        </div>
        <div className="border-t border-black/[0.06]" />
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-[16px] font-semibold">Bundle ID</span>
          <span className="text-[15px] text-muted">vernoch.DateDay</span>
        </div>
      </div>

      <p className="mt-5 px-1 text-[13px] text-muted">
        Přidej na plochu: Safari → Sdílet → Na plochu
      </p>
    </div>
  )
}
