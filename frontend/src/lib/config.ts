export function getApiBaseUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim()
  if (envUrl) {
    return envUrl.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    const port = window.location.port
    if (port === '3000') {
      return 'http://localhost:3001'
    }
    return window.location.origin.replace(/\/$/, '')
  }
  return 'http://localhost:3001'
}

export function getHealthUrl(): string {
  return `${getApiBaseUrl()}/health`
}