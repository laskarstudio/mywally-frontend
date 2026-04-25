import { useQuery } from '@tanstack/react-query'
import { fetchAccountSummary, fetchRecentTransactions, queryKeys } from '../api'

export function useAccountSummary() {
  return useQuery({
    queryKey: queryKeys.accountSummary(),
    queryFn:  fetchAccountSummary,
    staleTime: 60_000,
  })
}

export function useRecentTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions(),
    queryFn:  fetchRecentTransactions,
    staleTime: 30_000,
  })
}
