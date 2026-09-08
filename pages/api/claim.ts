import type { NextApiRequest, NextApiResponse } from 'next'
import redis from '../../lib/redis'

function getIp(req: NextApiRequest) {
  const forwarded = req.headers['x-forwarded-for'] || ''
  const ip = Array.isArray(forwarded) ? forwarded[0] : (forwarded as string).split(',')[0] || req.socket.remoteAddress || 'unknown'
  return ip.replace(/[^0-9a-fA-F\.:]/g, '')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' })

  const ip = getIp(req)
  const claimKey = `claim:${ip}`

  try {
    const existing = await redis.get(claimKey)
    if (existing) {
      // existing is JSON string
      const parsed = typeof existing === 'string' ? JSON.parse(existing) : existing
      const elapsed = Math.floor((Date.now() - parsed.timestamp) / 1000)
      const retryAfter = Math.max(0, 24 * 3600 - elapsed)
      return res.status(429).json({ success: false, message: 'IP này đã lấy rồi trong 24 giờ', retryAfterSeconds: retryAfter })
    }

    // Pop one account
    const raw = await redis.rpop('accounts')
    if (!raw) return res.status(200).json({ success: false, message: 'Hết acc, vui lòng quay lại sau' })

    const account = typeof raw === 'string' ? JSON.parse(raw) : raw

    const claim = { account, timestamp: Date.now() }
    // store claim with TTL 24h
    await redis.set(claimKey, JSON.stringify(claim), { ex: 24 * 3600 })

    return res.status(200).json({ success: true, account })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
