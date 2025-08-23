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
  getRecentFines,
  getUser,
  getActiveUsers
} from '@/lib/supabase/queries/fines'
import type { CreateFineInput, UpdateFineInput, FineFilters } from '@/lib/validations/fines'
import { useAuthWithProfile } from '@/hooks/auth/use-auth-with-profile'

/**
 * Query key factories for React Query.
 * These provide unique keys for caching and refetching data related to fines and users.
 */
export const finesKeys = {
  // Base key for all fines-related queries
  all: ['fines'] as const,
  // Key for lists of fines (with or without filters)
  lists: () => [...finesKeys.all, 'list'] as const,
  // Key for a specific list of fines, optionally filtered
  list: (filters?: FineFilters) => [...finesKeys.lists(), filters] as const,
  // Key for fine details (all details)
  details: () => [...finesKeys.all, 'detail'] as const,
  // Key for a specific fine's details
  detail: (id: string) => [...finesKeys.details(), id] as const,
  // Key for summary data about fines
  summary: () => [...finesKeys.all, 'summary'] as const,
  // Key for recent fines, optionally limited
  recent: (limit?: number) => [...finesKeys.all, 'recent', limit] as const,
}

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  active: () => [...usersKeys.lists(), 'active'] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
}

/**
 * useFines is a React Query hook that fetches a list of fines from the backend.
 * 
 * - It takes optional filters (such as player, type, etc).
 * - It uses a unique query key (from finesKeys.list) so React Query can cache and refetch as needed.
 * - The queryFn (getFines) is called with the filters and is responsible for fetching the data.
 * - The hook returns the query result, including loading state, error, and data.
 */
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

// Get active users
export function useActiveUsers() {
  return useQuery({
    queryKey: usersKeys.active(),
    queryFn: getActiveUsers,
  })
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
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
      const { data: subjectUser, error: userError } = await getUser(input.subject_id)
      
      if (userError) {
        throw new Error('Failed to find subject user')
      }

      if (!subjectUser) {
        throw new Error('Subject user not found')
      }

      const fineData = {
        ...input,
        proposer_id: user.id,
        proposer_name: profile.display_name,
        subject_name: subjectUser.display_name,
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