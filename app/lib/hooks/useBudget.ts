import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBudget, saveBudget, queryKeys } from '../api'

export function useBudget() {
  return useQuery({
    queryKey: queryKeys.budget(),
    queryFn:  fetchBudget,
    staleTime: 60_000,
  })
}

export function useSaveBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveBudget,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.budget(), data)
    },
  })
}
