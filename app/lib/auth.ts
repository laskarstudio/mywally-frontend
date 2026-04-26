// ⚠️  DEMO ONLY — JWT stored in localStorage. Not suitable for production.

const JWT_KEY    = 'mywally.jwt'
const USER_ID_KEY = 'mywally.userId'
const FAMILY_KEY  = 'mywally.familyId'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(JWT_KEY)
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_ID_KEY)
}

export function getFamilyId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(FAMILY_KEY)
}

export function setAuth(token: string, userId: string, familyId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(JWT_KEY, token)
  localStorage.setItem(USER_ID_KEY, userId)
  localStorage.setItem(FAMILY_KEY, familyId)
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(JWT_KEY)
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(FAMILY_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
