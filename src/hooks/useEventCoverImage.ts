import { useEffect, useState } from 'react'
import { fetchLinkPreview, normalizeUrl } from '../lib/linkPreview'

/**
 * Resolve a background image for a date card:
 * cached previewImageUrl → live Microlink from link → uploaded imageUrl.
 */
export function useEventCoverImage(opts: {
  link?: string
  previewImageUrl?: string
  imageUrl?: string
}): { src: string | null; loading: boolean } {
  const link = opts.link?.trim() || ''
  const cached = opts.previewImageUrl?.trim() || ''
  const uploaded = opts.imageUrl?.trim() || ''
  const [fetched, setFetched] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(link && !cached && !uploaded))

  useEffect(() => {
    if (cached || uploaded || !link) {
      setFetched(null)
      setLoading(false)
      return
    }
    const normalized = normalizeUrl(link)
    if (!normalized) {
      setFetched(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    fetchLinkPreview(normalized).then((data) => {
      if (cancelled) return
      setFetched(data?.imageUrl ?? null)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [link, cached, uploaded])

  const src = cached || fetched || uploaded || null
  return { src, loading }
}
