# Liên Quân claim (Vercel + Upstash Redis)

Small Next.js app that lets users "claim" an account (you upload accounts) with the rule: 1 IP can claim 1 time per 24 hours.

Features
- Next.js + TypeScript
- Serverless API routes for /api/claim and /api/admin/upload
- Upstash Redis as backing store (recommended for Vercel)
- ADMIN_TOKEN protection for upload/status endpoints

Environment variables (set these on Vercel)
- UPSTASH_REST_URL
- UPSTASH_REST_TOKEN
- ADMIN_TOKEN (set to a strong secret)

Quick deploy
1. Create Upstash Redis (REST) and copy REST URL and token.
2. Import this repo into Vercel (import from GitHub).
3. Add environment variables listed above in Vercel project settings.
4. Deploy.

API
- POST /api/admin/upload (X-ADMIN-TOKEN header required)
  - Content-Type: application/json or text/csv
  - JSON: array of objects [{"user":"u","pass":"p"}, ...]
  - CSV: each line `user,pass`

- GET /api/claim
  - returns { success, account } or { success:false, message, retryAfterSeconds }

Local dev
- cp .env.example .env.local
- npm install
- npm run dev

Security & notes
- You must only upload accounts you own/share legally.
- Change ADMIN_TOKEN before production.

