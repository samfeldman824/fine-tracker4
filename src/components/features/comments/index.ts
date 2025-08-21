// Comment components exports
export { default as CommentForm, ReplyForm } from './comment-form'
export { default as CommentList } from './comment-list'

// Re-export types for convenience
export type {
  Comment,
  CreateCommentInput,
  UpdateCommentInput,
  CommentFilters,
  CommentWithReplies,
  CommentSortOption
} from '@/lib/validations/comments'