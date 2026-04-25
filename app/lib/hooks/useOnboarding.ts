import { useMutation } from '@tanstack/react-query'
import { addFamilyMember, completeOnboarding, saveConsent } from '../api'

export function useSaveConsent() {
  return useMutation({ mutationFn: saveConsent })
}

export function useAddFamilyMember() {
  return useMutation({ mutationFn: addFamilyMember })
}

export function useCompleteOnboarding() {
  return useMutation({ mutationFn: completeOnboarding })
}
