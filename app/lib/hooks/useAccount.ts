import { useQuery } from '@tanstack/react-query'
import { fetchAccountSummary, queryKeys } from '../api'

export function useAccountSummary() {
  return useQuery({
    queryKey: queryKeys.accountSummary(),
    queryFn:  fetchAccountSummary,
    staleTime: 60_000,
  })
}
