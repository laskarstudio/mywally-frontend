'use client'

import { useParams, useRouter } from 'next/navigation'
import StatusBar from '@/app/components/status-bar'
import BottomNav from '@/app/components/bottom-nav'
import ConsentCheckItem from '@/app/components/consent-check-item'

const MEMBER_DATA: Record<string, { name: string; relationship: string }> = {
  radhiah: { name: 'Nur Radhiah', relationship: 'Daughter' },
  amirul: { name: 'Amirul Ruzaimi', relationship: 'Son' },
}

function PersonIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="24" r="16" fill="#E5E7EB" />
      <path d="M8 60c0-18 8-26 24-26s24 8 24 26" fill="#D1D5DB" />
    </svg>
  )
}

export default function MemberProfilePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const member = MEMBER_DATA[params.id] ?? { name: 'Family Member', relationship: 'Member' }

  return (
    <div className="flex flex-col flex-1">

      {/* Orange header */}
      <div className="bg-accent text-center flex-shrink-0">
        <StatusBar variant="light" />
        <div className="px-5 pb-16 mt-2">
          <h1 className="text-white font-bold text-2xl">{member.name}</h1>
          <p className="text-white/80 text-sm mt-1">{member.relationship}</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface pb-8">

        {/* Profile avatar — overlaps header */}
        <div className="flex justify-center -mt-14 mb-4">
          <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
            <PersonIllustration />
          </div>
        </div>

        {/* Connected badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-green-50 border border-success/30 text-success text-sm font-semibold px-5 py-1.5 rounded-full">
            Connected
          </span>
        </div>

        <div className="px-4 space-y-5">
          {/* Permissions */}
          <div>
            <p className="font-bold text-foreground text-center mb-3">Permission Given</p>
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <ConsentCheckItem label="View balance" />
              <ConsentCheckItem label="View transaction history" />
              <ConsentCheckItem label="Receive alerts" />
            </div>
          </div>

          {/* Manage permissions link */}
          <div className="text-center">
            <button className="text-primary text-sm font-semibold underline underline-offset-2">
              Manage Permissions
            </button>
          </div>

          {/* Remove access */}
          <button
            onClick={() => router.back()}
            className="w-full h-[52px] rounded-2xl bg-danger text-white font-bold text-base active:opacity-80 transition-opacity"
          >
            Remove Access
          </button>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
