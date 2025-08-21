// Comment hooks exports
export {
  useComments,
  useThreadedComments,
  useComment,
  useCommentCount,
  useRecentComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useOptimisticCreateComment,
  useInvalidateComments,
  commentsKeys
} from './use-comments'

export {
  useRealtimeComments,
  useRealtimeCommentActivity
} from './use-realtime-comments'

// Re-export types for convenience
export type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
  CommentFilters,
  CommentWithReplies,
  CommentSortOption
} from '@/lib/validations/comments'