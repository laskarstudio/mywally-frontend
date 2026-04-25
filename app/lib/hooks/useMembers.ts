import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMember, fetchMembers, removeMember, queryKeys } from '../api'

export function useMembers() {
  return useQuery({
    queryKey: queryKeys.members(),
    queryFn:  fetchMembers,
    staleTime: 60_000,
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: queryKeys.member(id),
    queryFn:  () => fetchMember(id),
    enabled:  !!id,
    staleTime: 60_000,
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members() })
    },
  })
}
