import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#7C3AED',
}

export default function WallyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
