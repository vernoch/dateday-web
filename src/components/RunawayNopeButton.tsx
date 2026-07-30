import { useCallback, useRef, useState } from 'react'

const NOPE_TEXTS = ['Ne', 'Zkus znovu', 'Rozmysli si to', 'Hezký pokus']

export function RunawayNopeButton({ onDecline }: { onDecline?: () => void }) {
  const areaRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [textIdx, setTextIdx] = useState(0)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const runAway = useCallback(() => {
    const area = areaRef.current
    const btn = btnRef.current
    if (!area || !btn) return

    const areaRect = area.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    const maxX = Math.max(0, areaRect.width - btnRect.width - 8)
    const maxY = Math.max(0, areaRect.height - btnRect.height - 8)
    setPos({
      x: 8 + Math.random() * maxX,
      y: 8 + Math.random() * maxY,
    })
    setTextIdx((i) => Math.min(i + 1, NOPE_TEXTS.length - 1))
  }, [])

  return (
    <div ref={areaRef} className="relative mx-auto mt-4 h-16 w-full max-w-xs">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={runAway}
        onTouchStart={(e) => {
          e.preventDefault()
          runAway()
        }}
        onClick={() => onDecline?.()}
        style={
          pos
            ? { position: 'absolute', left: pos.x, top: pos.y, transition: 'left 0.15s, top 0.15s' }
            : { position: 'relative' }
        }
        className="rounded-full bg-chip px-8 py-3.5 text-[16px] font-semibold text-muted shadow-sm"
      >
        {NOPE_TEXTS[textIdx]}
      </button>
    </div>
  )
}
