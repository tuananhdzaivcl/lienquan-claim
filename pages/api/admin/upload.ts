import type { NextApiRequest, NextApiResponse } from 'next'
import redis from '../../../lib/redis'
import { parse } from 'csv-parse/sync'

function okAdmin(req: NextApiRequest) {
  const token = req.headers['x-admin-token'] as string | undefined
  return token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!okAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' })

  if (req.method === 'POST') {
    const ct = req.headers['content-type'] || ''
    try {
      let accounts: Array<{ user: string; pass: string }> = []

      if (ct.includes('application/json')) {
        const body = req.body
        if (!Array.isArray(body)) return res.status(400).json({ success: false, message: 'Expected JSON array' })
        for (const item of body) {
          if (Array.isArray(item)) {
            accounts.push({ user: String(item[0]), pass: String(item[1]) })
          } else if (item && (item.user || item.pass)) {
            accounts.push({ user: String(item.user), pass: String(item.pass) })
          }
        }
      } else {
        // assume CSV/text
        const raw = (req.body && typeof req.body === 'string') ? req.body : ''
        if (!raw) return res.status(400).json({ success: false, message: 'Empty body' })
        const records = parse(raw, { skip_empty_lines: true })
        for (const r of records) {
          if (r.length >= 2) accounts.push({ user: String(r[0]), pass: String(r[1]) })
        }
      }

      if (accounts.length === 0) return res.status(400).json({ success: false, message: 'No accounts parsed' })

      // push accounts to the list
      // we'll lpush so rpop returns in FIFO order
      const pushed = []
      for (const acc of accounts) {
        const entry = JSON.stringify(acc)
        await redis.lpush('accounts', entry)
        pushed.push(acc)
      }

      return res.status(200).json({ success: true, pushed: pushed.length })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: 'Upload failed' })
    }
  }

  if (req.method === 'GET') {
    // status
    try {
      const count = await redis.llen('accounts')
      // list a few claims (not all) by scanning keys is not efficient; we'll show count only
      return res.status(200).json({ success: true, accountsLeft: count })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: 'Server error' })
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' })
}
