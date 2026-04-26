import { useMutation } from '@tanstack/react-query'
import { bootstrapFamily } from '../api'

export function useBootstrapFamily() {
  return useMutation({ mutationFn: bootstrapFamily })
}
