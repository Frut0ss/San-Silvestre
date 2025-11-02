'use client'

import dynamic from 'next/dynamic'

const SanSilvestreApp = dynamic(() => import('./SanSilvestreApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
      <div className="text-white text-2xl font-bold">Cargando...</div>
    </div>
  ),
})

export default function Home() {
  return <SanSilvestreApp />
}