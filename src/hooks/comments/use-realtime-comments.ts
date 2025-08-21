'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToComments } from '@/lib/supabase/queries/comments'
import { commentsKeys } from './use-comments'
import type { Comment } from '@/lib/supabase/queries/comments'
import type { CommentWithReplies } from '@/lib/validations/comments'

interface UseRealtimeCommentsOptions {
  fineId: string
  enabled?: boolean
  onCommentAdded?: (comment: Comment) => void
  onCommentUpdated?: (comment: Comment) => void
  onCommentDeleted?: (comment: Comment) => void
}

export function useRealtimeComments({
  fineId,
  enabled = true,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted
}: UseRealtimeCommentsOptions) {
  const queryClient = useQueryClient()

  // Handle new comment insertion
  const handleInsert = useCallback((comment: Comment) => {
    // Update flat comments list
    queryClient.setQueryData(
      commentsKeys.list(fineId),
      (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: [comment, ...old.data]
        }
      }
    )

    // Update threaded comments - Slack-style (simpler structure)
    queryClient.setQueryData(
      commentsKeys.threaded(fineId),
      (old: any) => {
        if (!old?.data) return old
        
        if (!comment.parent_id) {
          // Root comment - add at beginning
          return {
            ...old,
            data: [{ ...comment, replies: [], reply_count: 0 }, ...old.data]
          }
        } else {
          // Reply to existing comment - find the parent and add to its replies
          return {
            ...old,
            data: old.data.map((existingComment: CommentWithReplies) => {
              if (existingComment.id === comment.parent_id) {
                const updatedReplies = [...(existingComment.replies || []), comment]
                return {
                  ...existingComment,
                  replies: updatedReplies,
                  reply_count: updatedReplies.length
                }
              }
              return existingComment
            })
          }
        }
      }
    )

    // Update comment count
    queryClient.setQueryData(
      commentsKeys.count(fineId),
      (old: number | undefined) => (old || 0) + 1
    )

    // Invalidate fines to update comment count
    queryClient.invalidateQueries({ queryKey: ['fines'] })

    // Call custom callback
    onCommentAdded?.(comment)
  }, [queryClient, fineId, onCommentAdded])

  // Handle comment updates
  const handleUpdate = useCallback((comment: Comment) => {
    // Update specific comment in detail cache
    queryClient.setQueryData(commentsKeys.detail(comment.id), { data: comment })

    // Update in flat list
    queryClient.setQueryData(
      commentsKeys.list(fineId),
      (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((c: Comment) => 
            c.id === comment.id ? comment : c
          )
        }
      }
    )

    // Update in threaded structure - Slack-style
    queryClient.setQueryData(
      commentsKeys.threaded(fineId),
      (old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.map((rootComment: CommentWithReplies) => {
            // Check if it's a root comment
            if (rootComment.id === comment.id) {
              return { ...rootComment, ...comment }
            }
            
            // Check if it's in the replies
            if (rootComment.replies) {
              const updatedReplies = rootComment.replies.map((reply: Comment) => 
                reply.id === comment.id ? { ...reply, ...comment } : reply
              )
              // Recalculate reply count based on non-deleted replies
              const visibleReplies = updatedReplies.filter(r => !r.is_deleted)
              return { ...rootComment, replies: updatedReplies, reply_count: visibleReplies.length }
            }
            
            return rootComment
          })
        }
      }
    )

    // Call custom callback
    onCommentUpdated?.(comment)
  }, [queryClient, fineId, onCommentUpdated])

  // Handle comment deletion
  const handleDelete = useCallback((comment: Comment) => {
    // Remove from flat list if hard deleted, or update if soft deleted
    queryClient.setQueryData(
      commentsKeys.list(fineId),
      (old: any) => {
        if (!old?.data) return old
        
        if (comment.is_deleted) {
          // Soft delete - update the comment
          return {
            ...old,
            data: old.data.map((c: Comment) => 
              c.id === comment.id ? comment : c
            )
          }
        } else {
          // Hard delete - remove from list
          return {
            ...old,
            data: old.data.filter((c: Comment) => c.id !== comment.id)
          }
        }
      }
    )

    // Update in threaded structure - Slack-style
    queryClient.setQueryData(
      commentsKeys.threaded(fineId),
      (old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.map((rootComment: CommentWithReplies) => {
            // Check if it's a root comment
            if (rootComment.id === comment.id) {
              return { ...rootComment, ...comment }
            }
            
            // Check if it's in the replies
            if (rootComment.replies) {
              const updatedReplies = rootComment.replies.map((reply: Comment) => 
                reply.id === comment.id ? { ...reply, ...comment } : reply
              )
              // Recalculate reply count based on non-deleted replies
              const visibleReplies = updatedReplies.filter(r => !r.is_deleted)
              return { ...rootComment, replies: updatedReplies, reply_count: visibleReplies.length }
            }
            
            return rootComment
          })
        }
      }
    )

    // Update comment count only if actually deleted (not soft delete)
    if (!comment.is_deleted) {
      queryClient.setQueryData(
        commentsKeys.count(fineId),
        (old: number | undefined) => Math.max(0, (old || 0) - 1)
      )
      
      // Invalidate fines to update comment count
      queryClient.invalidateQueries({ queryKey: ['fines'] })
    }

    // Call custom callback
    onCommentDeleted?.(comment)
  }, [queryClient, fineId, onCommentDeleted])

  useEffect(() => {
    if (!enabled || !fineId) return

    const subscription = subscribeToComments(
      fineId,
      handleInsert,
      handleUpdate,
      handleDelete
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fineId, enabled, handleInsert, handleUpdate, handleDelete])

  // Return methods to manually trigger cache updates
  return {
    // Method to manually refresh all comment queries
    refresh: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.list(fineId) })
      queryClient.invalidateQueries({ queryKey: commentsKeys.threaded(fineId) })
      queryClient.invalidateQueries({ queryKey: commentsKeys.count(fineId) })
    }, [queryClient, fineId]),

    // Method to optimistically add a comment (useful for immediate UI feedback)
    optimisticallyAddComment: useCallback((comment: Comment) => {
      handleInsert(comment)
    }, [handleInsert]),

    // Method to optimistically update a comment
    optimisticallyUpdateComment: useCallback((comment: Comment) => {
      handleUpdate(comment)
    }, [handleUpdate])
  }
}

// Hook for subscribing to all comment activity (for notifications, activity feeds, etc.)
export function useRealtimeCommentActivity(options?: {
  enabled?: boolean
  onActivity?: (activity: {
    type: 'insert' | 'update' | 'delete'
    comment: Comment
    fineId: string
  }) => void
}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!options?.enabled) return

    // This would require a broader subscription or multiple subscriptions
    // For now, we'll keep it simple and just invalidate recent comments
    const handleActivity = (type: 'insert' | 'update' | 'delete', comment: Comment) => {
      // Invalidate recent comments
      queryClient.invalidateQueries({ queryKey: commentsKeys.recent() })
      
      // Call custom callback
      options.onActivity?.({
        type,
        comment,
        fineId: comment.fine_id
      })
    }

    // In a real implementation, you might subscribe to a global comments channel
    // or use database triggers/functions to notify of all comment activity
    
    // For now, this hook is primarily a placeholder for future enhancements
    return () => {
      // Cleanup
    }
  }, [options?.enabled, options?.onActivity, queryClient])

  return {
    // Method to manually refresh recent comments
    refreshRecent: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.recent() })
    }, [queryClient])
  }
}

export default useRealtimeComments