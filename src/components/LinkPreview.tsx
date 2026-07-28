import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import {
  fetchLinkPreview,
  linkHostname,
  normalizeUrl,
  type LinkPreviewData,
} from '../lib/linkPreview'

type LinkPreviewProps = {
  url: string
  variant?: 'hero' | 'compact'
  className?: string
}

export function LinkPreview({ url, variant = 'compact', className = '' }: LinkPreviewProps) {
  const normalized = normalizeUrl(url)
  const [preview, setPreview] = useState<LinkPreviewData | null>(
    normalized ? { url: normalized } : null,
  )
  const [loading, setLoading] = useState(Boolean(normalized))

  useEffect(() => {
    if (!normalized) {
      setPreview(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setPreview({ url: normalized })

    fetchLinkPreview(normalized).then((data) => {
      if (!cancelled && data) setPreview(data)
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [normalized])

  if (!normalized || !preview) return null

  const hostname = linkHostname(preview.url)
  const title = preview.title || hostname

  if (variant === 'hero') {
    return (
      <a
        href={preview.url}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(e) => e.stopPropagation()}
        className={`block overflow-hidden border-b border-black/5 bg-white/80 ${className}`}
      >
        {preview.imageUrl ? (
          <img src={preview.imageUrl} alt="" className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-32 items-center justify-center bg-gradient-to-br from-love-soft to-white text-4xl">
            🔗
          </div>
        )}
        <div className="space-y-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 font-semibold">{loading ? 'Načítám náhled…' : title}</p>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          </div>
          {!loading && preview.description && (
            <p className="line-clamp-2 text-sm text-muted">{preview.description}</p>
          )}
          <p className="text-xs text-love">{hostname}</p>
        </div>
      </a>
    )
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(e) => e.stopPropagation()}
      className={`flex gap-3 overflow-hidden rounded-2xl border border-black/5 bg-white/90 p-3 ${className}`}
    >
      {preview.imageUrl ? (
        <img src={preview.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-love-soft text-xl">
          🔗
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold">{loading ? 'Načítám náhled…' : title}</p>
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
        </div>
        {!loading && preview.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{preview.description}</p>
        )}
        <p className="mt-1 text-[11px] text-love">{hostname}</p>
      </div>
    </a>
  )
}
