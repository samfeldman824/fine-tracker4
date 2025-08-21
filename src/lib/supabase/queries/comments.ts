import { createClient } from '@/lib/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types'
import type { CommentFilters, CommentSortOption, CommentWithReplies } from '@/lib/validations/comments'

export type Comment = Tables<'comments'>
export type InsertComment = TablesInsert<'comments'>
export type UpdateComment = TablesUpdate<'comments'>

// Get comments for a fine with optional filters
export async function getComments(fineId: string, filters?: CommentFilters, sort: CommentSortOption = 'newest', limit = 100) {
  const supabase = createClient()
  let query = supabase
    .from('comments')
    .select('*')
    .eq('fine_id', fineId)
    .eq('is_deleted', false)

  // Apply filters
  if (filters?.author_id) {
    query = query.eq('author_id', filters.author_id)
  }
  
  if (filters?.parent_id !== undefined) {
    if (filters.parent_id === null) {
      query = query.is('parent_id', null)
    } else {
      query = query.eq('parent_id', filters.parent_id)
    }
  }
  
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from)
  }
  
  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to)
  }
  
  if (filters?.search) {
    query = query.or(`content.ilike.%${filters.search}%,author_name.ilike.%${filters.search}%`)
  }

  // Apply sorting
  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'thread':
      query = query.order('path', { ascending: true, nullsFirst: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  return query.limit(limit)
}

// Get comments in Slack-style threading (top-level comments with flat replies)
export async function getThreadedComments(fineId: string, sort: CommentSortOption = 'thread'): Promise<{ data: CommentWithReplies[] | null, error: any }> {
  const { data: comments, error } = await getComments(fineId, undefined, sort)
  
  if (error || !comments) {
    return { data: null, error }
  }

  // Separate root comments from replies
  const rootComments: CommentWithReplies[] = []
  const repliesMap = new Map<string, Comment[]>()

  // Group comments by parent
  comments.forEach(comment => {
    if (!comment.parent_id) {
      // This is a root comment
      rootComments.push({ 
        ...comment, 
        replies: [], 
        reply_count: 0 
      })
    } else {
      // This is a reply
      if (!repliesMap.has(comment.parent_id)) {
        repliesMap.set(comment.parent_id, [])
      }
      repliesMap.get(comment.parent_id)!.push(comment)
    }
  })

  // Attach replies to their parent comments
  rootComments.forEach(rootComment => {
    const replies = repliesMap.get(rootComment.id) || []
    
    // Sort replies (always chronological for Slack-style)
    replies.sort((a, b) => 
      new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
    )
    
    rootComment.replies = replies
    rootComment.reply_count = replies.length
  })

  // Sort root comments based on sort option
  rootComments.sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      case 'newest':
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      case 'thread':
      default:
        // For thread view, sort by latest activity (latest reply or comment creation)
        const aLatest = a.replies && a.replies.length > 0 
          ? Math.max(new Date(a.created_at || '').getTime(), ...a.replies.map(r => new Date(r.created_at || '').getTime()))
          : new Date(a.created_at || '').getTime()
        const bLatest = b.replies && b.replies.length > 0
          ? Math.max(new Date(b.created_at || '').getTime(), ...b.replies.map(r => new Date(r.created_at || '').getTime()))
          : new Date(b.created_at || '').getTime()
        return bLatest - aLatest
    }
  })

  return { data: rootComments, error: null }
}

// Get a single comment by ID
export async function getComment(id: string) {
  const supabase = createClient()
  return supabase
    .from('comments')
    .select('*')
    .eq('id', id)
    .single()
}

// Create a new comment
export async function createComment(comment: Omit<InsertComment, 'author_name' | 'author_username'>) {
  const supabase = createClient()
  
  // Get current user info
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('User not authenticated')

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('display_name, username')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile) throw new Error('User profile not found')

  // Validate Slack-style threading (prevent replies to replies)
  if (comment.parent_id) {
    const { data: parentComment, error: parentError } = await getComment(comment.parent_id)
    if (parentError || !parentComment) throw new Error('Parent comment not found')
    
    // In Slack-style threading, prevent replies to replies
    if (parentComment.parent_id) {
      throw new Error('Cannot reply to a reply. Please reply to the original comment.')
    }
  }

  const newComment: InsertComment = {
    ...comment,
    author_id: user.id,
    author_name: profile.display_name,
    author_username: profile.username,
  }

  const result = await supabase
    .from('comments')
    .insert(newComment)
    .select()
    .single()

  // Update fine comment count
  if (result.data) {
    await updateFineCommentCount(comment.fine_id)
  }

  return result
}

// Update a comment
export async function updateComment(id: string, updates: Pick<UpdateComment, 'content'>) {
  const supabase = createClient()
  
  // Verify user owns the comment
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('User not authenticated')

  const { data: existingComment, error: fetchError } = await getComment(id)
  if (fetchError || !existingComment) throw new Error('Comment not found')
  
  if (existingComment.author_id !== user.id) {
    throw new Error('You can only edit your own comments')
  }

  return supabase
    .from('comments')
    .update({
      ...updates,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
}

// Delete a comment (soft delete)
export async function deleteComment(id: string) {
  const supabase = createClient()
  
  // Verify user owns the comment
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('User not authenticated')

  const { data: existingComment, error: fetchError } = await getComment(id)
  if (fetchError || !existingComment) throw new Error('Comment not found')
  
  if (existingComment.author_id !== user.id) {
    throw new Error('You can only delete your own comments')
  }

  const result = await supabase
    .from('comments')
    .update({
      is_deleted: true,
      content: '[deleted]',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  // Update fine comment count
  if (result.data) {
    await updateFineCommentCount(existingComment.fine_id)
  }

  return result
}

// Get comment count for a fine
export async function getCommentCount(fineId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('id', { count: 'exact' })
    .eq('fine_id', fineId)
    .eq('is_deleted', false)

  if (error) throw error

  return data?.length || 0
}

// Update fine comment count (helper function)
async function updateFineCommentCount(fineId: string) {
  const supabase = createClient()
  
  const count = await getCommentCount(fineId)
  
  await supabase
    .from('fines')
    .update({ comment_count: count })
    .eq('id', fineId)
}

// Get recent comments for dashboard
export async function getRecentComments(limit = 10) {
  const supabase = createClient()
  return supabase
    .from('comments')
    .select(`
      *,
      fines!inner(
        id,
        description,
        subject_name,
        proposer_name
      )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)
}

// Setup real-time subscription for comments
export function subscribeToComments(
  fineId: string,
  onInsert?: (comment: Comment) => void,
  onUpdate?: (comment: Comment) => void,
  onDelete?: (comment: Comment) => void
) {
  const supabase = createClient()
  
  return supabase
    .channel(`comments:${fineId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `fine_id=eq.${fineId}`,
      },
      (payload) => onInsert?.(payload.new as Comment)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'comments',
        filter: `fine_id=eq.${fineId}`,
      },
      (payload) => onUpdate?.(payload.new as Comment)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
        filter: `fine_id=eq.${fineId}`,
      },
      (payload) => onDelete?.(payload.old as Comment)
    )
    .subscribe()
}