import { useMutation } from '@tanstack/react-query'
import { initiateTransfer } from '../api'

export function useInitiateTransfer() {
  return useMutation({
    mutationFn: initiateTransfer,
  })
}
