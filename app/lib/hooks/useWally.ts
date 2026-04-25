import { useMutation } from '@tanstack/react-query'
import { fetchWallyResponse } from '../api'

export function useWallyQuery() {
  return useMutation({
    mutationFn: fetchWallyResponse,
  })
}
