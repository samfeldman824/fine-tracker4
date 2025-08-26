'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getComments, 
  getThreadedComments,
  getComment,
  createComment, 
  updateComment, 
  deleteComment,
  getCommentCount,
  getRecentComments
} from '@/lib/supabase/queries/comments'
import type { 
  CreateCommentInput, 
  UpdateCommentInput, 
  CommentFilters, 
  CommentSortOption, 
  CommentWithReplies
} from '@/lib/validations/comments'
import { useAuthWithProfile } from '@/hooks/auth/use-auth-with-profile'

// Query keys
export const commentsKeys = {
  all: ['comments'] as const,
  lists: () => [...commentsKeys.all, 'list'] as const,
  list: (fineId: string, filters?: CommentFilters, sort?: CommentSortOption) => 
    [...commentsKeys.lists(), fineId, filters, sort] as const,
  threaded: (fineId: string, sort?: CommentSortOption) => 
    [...commentsKeys.all, 'threaded', fineId, sort] as const,
  details: () => [...commentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...commentsKeys.details(), id] as const,
  count: (fineId: string) => [...commentsKeys.all, 'count', fineId] as const,
  recent: (limit?: number) => [...commentsKeys.all, 'recent', limit] as const,
}

// Get comments for a fine
export function useComments(
  fineId: string, 
  filters?: CommentFilters,
  sort: CommentSortOption = 'newest',
  limit = 100
) {
  return useQuery({
    queryKey: commentsKeys.list(fineId, filters, sort),
    queryFn: () => getComments(fineId, filters, sort, limit),
    enabled: !!fineId,
  })
}

// Get threaded/nested comments for a fine
export function useThreadedComments(
  fineId: string,
  sort: CommentSortOption = 'thread'
) {
  return useQuery({
    queryKey: commentsKeys.threaded(fineId, sort),
    queryFn: () => getThreadedComments(fineId, sort),
    enabled: !!fineId,
  })
}

// Get single comment
export function useComment(id: string) {
  return useQuery({
    queryKey: commentsKeys.detail(id),
    queryFn: () => getComment(id),
    enabled: !!id,
  })
}

// Get comment count for a fine
export function useCommentCount(fineId: string) {
  return useQuery({
    queryKey: commentsKeys.count(fineId),
    queryFn: () => getCommentCount(fineId),
    enabled: !!fineId,
  })
}

// Get recent comments
export function useRecentComments(limit = 10) {
  return useQuery({
    queryKey: commentsKeys.recent(limit),
    queryFn: () => getRecentComments(limit),
  })
}

// Create comment mutation
export function useCreateComment() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthWithProfile()

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      if (!user || !profile) {
        throw new Error('Must be authenticated to create comments')
      }

      return createComment(input)
    },
    onSuccess: (data) => {
      if (data.data) {
        const comment = data.data
        
        // Invalidate all comment queries for this fine
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.list(comment.fine_id) 
        })
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.threaded(comment.fine_id) 
        })
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.count(comment.fine_id) 
        })
        
        // Invalidate recent comments
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.recent() 
        })
        
        // Invalidate fines queries to update comment count
        queryClient.invalidateQueries({ queryKey: ['fines'] })
      }
    },
    onError: (error) => {
      console.error('Failed to create comment:', error)
    }
  })
}

// Update comment mutation
export function useUpdateComment() {
  const queryClient = useQueryClient()
  const { user } = useAuthWithProfile()

  return useMutation({
    mutationFn: async (input: UpdateCommentInput) => {
      if (!user) {
        throw new Error('Must be authenticated to update comments')
      }

      return updateComment(input.id, { content: input.content })
    },
    onSuccess: (data) => {
      if (data.data) {
        const comment = data.data
        
        // Update specific comment in cache
        queryClient.setQueryData(commentsKeys.detail(comment.id), data)
        
        // Invalidate comment lists for this fine
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.list(comment.fine_id) 
        })
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.threaded(comment.fine_id) 
        })
      }
    },
    onError: (error) => {
      console.error('Failed to update comment:', error)
    }
  })
}

// Delete comment mutation
export function useDeleteComment() {
  const queryClient = useQueryClient()
  const { user } = useAuthWithProfile()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('Must be authenticated to delete comments')
      }

      return deleteComment(id)
    },
    onSuccess: (data) => {
      if (data.data) {
        const comment = data.data
        
        // Update specific comment in cache to show as deleted
        queryClient.setQueryData(commentsKeys.detail(comment.id), data)
        
        // Invalidate comment queries for this fine
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.list(comment.fine_id) 
        })
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.threaded(comment.fine_id) 
        })
        queryClient.invalidateQueries({ 
          queryKey: commentsKeys.count(comment.fine_id) 
        })
        
        // Invalidate fines queries to update comment count
        queryClient.invalidateQueries({ queryKey: ['fines'] })
      }
    },
    onError: (error) => {
      console.error('Failed to delete comment:', error)
    }
  })
}

// Optimistic mutations for better UX
export function useOptimisticCreateComment() {
  const queryClient = useQueryClient()
  const { user, profile } = useAuthWithProfile()
  const createMutation = useCreateComment()

  return {
    ...createMutation,
    mutateAsync: async (input: CreateCommentInput) => {
      if (!user || !profile) {
        throw new Error('Must be authenticated to create comments')
      }

      // Create optimistic comment
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        fine_id: input.fine_id,
        parent_id: input.parent_id || null,
        author_id: user.id,
        author_name: profile?.display_name || user.email || 'Anonymous',
        author_username: profile?.username || user.email?.split('@')[0] || 'user',
        content: input.content,
        depth: 0, // Will be calculated on server
        path: null,
        is_deleted: false,
        is_edited: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Optimistically update the cache
      const threadsQueryKey = commentsKeys.threaded(input.fine_id)
      const previousThreads = queryClient.getQueryData(threadsQueryKey)

      queryClient.setQueryData(threadsQueryKey, (old: { data: CommentWithReplies[] } | undefined) => {
        if (!old?.data) return old
        
        if (input.parent_id) {
          // Add as reply - this is complex, so we'll just invalidate
          return old
        } else {
          // Add as new root comment
          return {
            ...old,
            data: [optimisticComment, ...old.data]
          }
        }
      })

      try {
        // Execute the actual mutation
        const result = await createMutation.mutateAsync(input)
        return result
      } catch (error) {
        // Revert optimistic update on error
        queryClient.setQueryData(threadsQueryKey, previousThreads)
        throw error
      }
    }
  }
}

// Helper to invalidate all comment-related queries
export function useInvalidateComments() {
  const queryClient = useQueryClient()
  
  return (fineId?: string) => {
    if (fineId) {
      queryClient.invalidateQueries({ queryKey: commentsKeys.list(fineId) })
      queryClient.invalidateQueries({ queryKey: commentsKeys.threaded(fineId) })
      queryClient.invalidateQueries({ queryKey: commentsKeys.count(fineId) })
    } else {
      queryClient.invalidateQueries({ queryKey: commentsKeys.all })
    }
  }
}