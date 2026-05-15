const ALLOWED_REDIRECT_HOSTS = new Set([
  'mysterria.net',
  'www.mysterria.net',
  'play.mysterria.net',
  'wiki.mysterria.net',
  'archive.mysterria.net',
])

export function isAllowedRedirectUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') return false
    return (
      ALLOWED_REDIRECT_HOSTS.has(parsed.hostname) ||
      parsed.hostname === 'localhost'
    )
  } catch {
    return false
  }
}
