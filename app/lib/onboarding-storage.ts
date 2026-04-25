type ConsentState = {
  elderlyMode: boolean
  familyShare: boolean
}

type FamilyMember = {
  phone: string
  relationship: string
}

export type OnboardingState = {
  complete: boolean
  consent: ConsentState
  familyMembers: FamilyMember[]
}

const KEY = 'mywally_onboarding'

const defaultState: OnboardingState = {
  complete: false,
  consent: { elderlyMode: false, familyShare: false },
  familyMembers: [],
}

export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState
  } catch {
    return defaultState
  }
}

export function setOnboardingState(patch: Partial<OnboardingState>): void {
  if (typeof window === 'undefined') return
  const current = getOnboardingState()
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }))
}

export function clearOnboardingState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
