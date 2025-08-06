const rateLimit = new Map()

export function rateLimiter(identifier: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimit.has(identifier)) {
    rateLimit.set(identifier, [])
  }
  
  const requests = rateLimit.get(identifier).filter((timestamp: number) => timestamp > windowStart)
  
  if (requests.length >= limit) {
    return false
  }
  
  requests.push(now)
  rateLimit.set(identifier, requests)
  
  return true
}
