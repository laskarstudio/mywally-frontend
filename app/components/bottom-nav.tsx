'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#7C3AED' : 'none'} stroke={active ? '#7C3AED' : '#6B7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#7C3AED' : '#6B7280'} strokeWidth="1.5" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const isHome = pathname === '/dashboard'
  const isProfile = pathname === '/profile'

  return (
    <>
      {/* In-flow spacer — keeps page content from sliding under the fixed nav */}
      <div className="h-24 flex-shrink-0" aria-hidden="true" />

      {/* Fixed nav — pinned to viewport bottom, capped to the phone shell width */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-border flex items-end justify-around px-6 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] overflow-visible">
        {/* Home */}
        <Link href="/dashboard" className="flex flex-col items-center gap-1 py-2">
          <HomeIcon active={isHome} />
          <span className={`text-[11px] font-medium ${isHome ? 'text-primary' : 'text-muted'}`}>Home</span>
        </Link>

        {/* Wally — elevated center button */}
        <Link href="/wally" className="flex flex-col items-center -mt-5">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg border-4 border-white">
            <Image
              src="/assets/my-wally-chat-profile.png"
              alt="Wally"
              width={32}
              height={32}
              className="rounded-full"
            />
          </div>
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex flex-col items-center gap-1 py-2">
          <ProfileIcon active={isProfile} />
          <span className={`text-[11px] font-medium ${isProfile ? 'text-primary' : 'text-muted'}`}>Profile</span>
        </Link>
      </nav>
    </>
  )
}
