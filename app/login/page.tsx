'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchFamilies, loginAsFamily } from '@/app/lib/api'
import { setAuth } from '@/app/lib/auth'
import { getOnboardingState } from '@/app/lib/onboarding-storage'
import type { Family } from '@/app/lib/types'

function FamilyCard({
  family,
  onSelect,
  loading,
}: {
  family: Family
  onSelect: () => void
  loading: boolean
}) {
  return (
    <button
      onClick={onSelect}
      disabled={loading}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4 active:bg-surface transition-colors disabled:opacity-50 text-left"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-primary font-bold text-lg">
          {family.parent.fullName.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-base">{family.parent.fullName}</p>
        {family.guardian && (
          <p className="text-muted text-sm truncate">
            Guardian: {family.guardian.fullName} ({family.guardian.relationshipLabel ?? 'Family'})
          </p>
        )}
      </div>
      <span className="text-muted text-xl">›</span>
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: families, isLoading, isError } = useQuery({
    queryKey: ['families'],
    queryFn:  fetchFamilies,
    staleTime: Infinity,
  })

  const { mutate: login, isPending } = useMutation({
    mutationFn: (userId: string) => loginAsFamily(userId),
    onSuccess: (res, userId) => {
      setAuth(res.token, res.user)
      // Store familyId for transaction submissions
      const family = families?.find(f => f.parent.id === userId)
      if (family) localStorage.setItem('mywally_familyId', family.familyId)

      const { complete } = getOnboardingState()
      router.replace(complete ? '/dashboard' : '/onboarding/consent')
    },
  })

  function handleSelect(family: Family) {
    setSelectedId(family.parent.id)
    login(family.parent.id)
  }

  // If already logged in skip the login page
  useEffect(() => {
    const token = localStorage.getItem('mywally_token')
    if (token) {
      const { complete } = getOnboardingState()
      router.replace(complete ? '/dashboard' : '/onboarding/consent')
    }
  }, [router])

  return (
    <div className="flex flex-col flex-1 bg-surface">

      {/* Purple header */}
      <div className="bg-primary text-center px-6 pb-10 flex-shrink-0">
        <div className="h-11" /> {/* status bar spacer */}
        <Image
          src="/assets/my-wally-splash-screen-logo.png"
          alt="myWally"
          width={64}
          height={64}
          className="mx-auto mb-3"
        />
        <p className="text-white text-2xl">
          <span className="font-light">my</span>
          <span className="font-bold">Wally</span>
        </p>
        <p className="text-white/70 text-sm mt-1">Your trusted financial companion</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6">

        <p className="text-foreground font-bold text-lg mb-1">Select your account</p>
        <p className="text-muted text-sm mb-5">Choose a demo family to continue</p>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-red-50 rounded-2xl p-4 text-center">
            <p className="text-danger font-semibold text-sm">Could not load accounts</p>
            <p className="text-muted text-xs mt-1">Check your connection and try again</p>
          </div>
        )}

        {families && (
          <div className="space-y-3">
            {families.map(family => (
              <FamilyCard
                key={family.familyId}
                family={family}
                onSelect={() => handleSelect(family)}
                loading={isPending && selectedId === family.parent.id}
              />
            ))}
          </div>
        )}

        <p className="text-center text-muted text-xs mt-8 leading-relaxed px-4">
          ⚠️ Demo mode — accounts use test data only
        </p>

      </div>
    </div>
  )
}
