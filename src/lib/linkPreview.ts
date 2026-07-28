export interface LinkPreviewData {
  title?: string
  description?: string
  imageUrl?: string
  url: string
}

export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withProtocol).toString()
  } catch {
    return null
  }
}

export function linkHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreviewData | null> {
  const url = normalizeUrl(rawUrl)
  if (!url) return null

  try {
    const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
    const json = (await res.json()) as {
      status?: string
      data?: {
        title?: string
        description?: string
        url?: string
        image?: { url?: string }
        logo?: { url?: string }
      }
    }

    if (json.status !== 'success' || !json.data) {
      return { url }
    }

    return {
      title: json.data.title,
      description: json.data.description,
      imageUrl: json.data.image?.url || json.data.logo?.url,
      url: json.data.url || url,
    }
  } catch {
    return { url }
  }
}
