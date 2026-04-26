import { useMutation } from '@tanstack/react-query'
import { addFamilyMember, completeOnboarding, saveConsent, createFamily } from '../api'

export function useSaveConsent() {
  return useMutation({ mutationFn: saveConsent })
}

export function useAddFamilyMember() {
  return useMutation({ mutationFn: addFamilyMember })
}

export function useCompleteOnboarding() {
  return useMutation({ mutationFn: completeOnboarding })
}

export function useCreateFamily() {
  return useMutation({ mutationFn: createFamily })
}
