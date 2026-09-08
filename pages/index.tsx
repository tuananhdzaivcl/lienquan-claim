import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function claim() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/claim')
      const json = await res.json()
      setResult(json)
    } catch (err) {
      setResult({ success: false, message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Claim Acc Liên Quân</h1>
      <p>Mỗi IP được lấy 1 lần trong 24 giờ.</p>
      <button onClick={claim} disabled={loading} style={{ padding: '8px 16px', fontSize: 16 }}>
        {loading ? 'Đang lấy...' : 'Lấy acc'}
      </button>

      {result && (
        <div style={{ marginTop: 16 }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <hr style={{ marginTop: 24 }} />
      <h3>Admin</h3>
      <p>Upload CSV or JSON to /api/admin/upload with header X-ADMIN-TOKEN.</p>
    </main>
  )
}
