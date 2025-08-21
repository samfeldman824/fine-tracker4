'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getFines, 
  getFine, 
  createFine, 
  updateFine, 
  deleteFine, 
  toggleArchiveFine,
  getFinesSummary,
  getRecentFines
} from '@/lib/supabase/queries/fines'
import type { CreateFineInput, UpdateFineInput, FineFilters } from '@/lib/validations/fines'
import { useAuthWithProfile } from '@/hooks/auth/use-auth-with-profile'

// Query keys
export const finesKeys = {
  all: ['fines'] as const,
  lists: () => [...finesKeys.all, 'list'] as const,
  list: (filters?: FineFilters) => [...finesKeys.lists(), filters] as const,
  details: () => [...finesKeys.all, 'detail'] as const,
  detail: (id: string) => [...finesKeys.details(), id] as const,
  summary: () => [...finesKeys.all, 'summary'] as const,
  recent: (limit?: number) => [...finesKeys.all, 'recent', limit] as const,
}

// Get all fines with filters
export function useFines(filters?: FineFilters) {
  return useQuery({
    queryKey: finesKeys.list(filters),
    queryFn: () => getFines(filters),
  })
}

// Get single fine
export function useFine(id: string) {
  return useQuery({
    queryKey: finesKeys.detail(id),
    queryFn: () => getFine(id),
    enabled: !!id,
  })
}

// Get fines summary
export function useFinesSummary() {
  return useQuery({
    queryKey: finesKeys.summary(),
    queryFn: getFinesSummary,
  })
}

// Get recent fines
export function useRecentFines(limit = 5) {
  return useQuery({
    queryKey: finesKeys.recent(limit),
    queryFn: () => getRecentFines(limit),
  })
}

// Create fine mutation
export function useCreateFine() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthWithProfile()

  return useMutation({
    mutationFn: async (input: CreateFineInput) => {
      if (!user || !profile) {
        throw new Error('Must be authenticated to create fines')
      }

      // Get subject user info for denormalized data
      // Note: In real app, you'd query the users table to get subject_name
      const fineData = {
        ...input,
        proposer_id: user.id,
        proposer_name: profile.display_name,
        subject_name: 'Unknown User', // TODO: Get from users table
      }

      return createFine(fineData)
    },
    onSuccess: () => {
      // Invalidate and refetch fines data
      queryClient.invalidateQueries({ queryKey: finesKeys.all })
    },
  })
}

// Update fine mutation
export function useUpdateFine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...updates }: UpdateFineInput) => {
      return updateFine(id, updates)
    },
    onSuccess: (data) => {
      // Update specific fine in cache
      if (data.data) {
        queryClient.setQueryData(finesKeys.detail(data.data.id), data)
      }
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: finesKeys.lists() })
    },
  })
}

// Delete fine mutation
export function useDeleteFine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: finesKeys.all })
    },
  })
}

// Toggle archive mutation
export function useToggleArchiveFine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, is_archived }: { id: string; is_archived: boolean }) => {
      return toggleArchiveFine(id, is_archived)
    },
    onSuccess: (data) => {
      if (data.data) {
        queryClient.setQueryData(finesKeys.detail(data.data.id), data)
      }
      queryClient.invalidateQueries({ queryKey: finesKeys.lists() })
    },
  })
}