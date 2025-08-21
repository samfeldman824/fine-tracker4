import { z } from 'zod'

// Base comment schema for Slack-style threading
export const commentSchema = z.object({
  id: z.string().uuid(),
  fine_id: z.string().uuid(),
  author_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  
  // Denormalized author info
  author_name: z.string().min(1, 'Author name is required'),
  author_username: z.string().min(1, 'Author username is required'),
  
  content: z.string().min(1, 'Comment content is required'),
  
  // Metadata
  is_deleted: z.boolean(), //.default(false),
  is_edited: z.boolean(),//.default(false),
  
  created_at: z.string(),
  updated_at: z.string(),
})

// Create comment schema (without auto-generated fields)
export const createCommentSchema = z.object({
  fine_id: z.string().uuid('Please provide a valid fine ID'),
  parent_id: z.string().uuid().optional().nullable(),
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment is too long (max 2000 characters)')
    .trim(),
})

// Update comment schema
export const updateCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment is too long (max 2000 characters)')
    .trim(),
})

// Comment filters schema
export const commentFiltersSchema = z.object({
  fine_id: z.string().uuid().optional(),
  author_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  is_deleted: z.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
})

// Comment with replies schema for Slack-style threading (flat structure)
export const commentWithRepliesSchema = commentSchema.extend({
  replies: commentSchema.array().optional(),
  reply_count: z.number().int().min(0).default(0),
})

// Types
export type Comment = z.infer<typeof commentSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
export type CommentFilters = z.infer<typeof commentFiltersSchema>

export interface CommentWithReplies extends Comment {
  replies?: Comment[]  // Flat array of replies, no deep nesting
  reply_count?: number
}

// Comment sorting options
export const commentSortOptions = {
  newest: 'created_at_desc',
  oldest: 'created_at_asc',
  thread: 'path_asc',
} as const

export type CommentSortOption = keyof typeof commentSortOptions

// Comment threading utilities - Slack style (only 2 levels: comments and replies)
export const MAX_COMMENT_DEPTH = 1  // Only allow replies to top-level comments
export const COMMENTS_PER_PAGE = 20
export const REPLIES_PER_THREAD = 50