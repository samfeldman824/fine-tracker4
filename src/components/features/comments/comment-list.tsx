'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useThreadedComments, useDeleteComment, useUpdateComment } from '@/hooks/comments/use-comments'
import { useRealtimeComments } from '@/hooks/comments/use-realtime-comments'
import { useAuthWithProfile } from '@/hooks/auth/use-auth-with-profile'
import { CommentForm, ReplyForm } from './comment-form'
import type { Comment, CommentWithReplies, CommentSortOption } from '@/lib/validations/comments'
import { User } from '@supabase/supabase-js'

interface CommentListProps {
  fineId: string
  showForm?: boolean
  sort?: CommentSortOption
}

export function CommentList({ 
  fineId, 
  showForm = true, 
  sort = 'thread'
}: CommentListProps) {
  const { data: commentsData, isLoading, error } = useThreadedComments(fineId, sort)
  const { user } = useAuthWithProfile()
  
  // Setup real-time updates
  useRealtimeComments({
    fineId,
    enabled: true,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-destructive">
            Failed to load comments. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const comments = commentsData?.data || []

  return (
    <div className="space-y-4">
      {showForm && (
        <CommentForm 
          fineId={fineId} 
          compact 
          placeholder="Add a comment..."
        />
      )}
      
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              fineId={fineId}
              currentUser={user}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CommentThreadProps {
  comment: CommentWithReplies
  fineId: string
  currentUser: User | null
}

// Main thread component that shows a root comment and its replies
function CommentThread({ comment, fineId, currentUser }: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(true)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="space-y-3">
      {/* Root Comment */}
      <CommentItem
        comment={comment}
        fineId={fineId}
        currentUser={currentUser}
        isReply={false}
      />
      
      {/* Replies */}
      {hasReplies && (
        <div className="ml-8 border-l-2 border-muted pl-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showReplies ? '▼' : '▶'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
            </Button>
          </div>
          
          {showReplies && comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              fineId={fineId}
              currentUser={currentUser}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: CommentWithReplies | Comment
  fineId: string
  currentUser: User | null
  isReply: boolean
}

// Individual comment component
function CommentItem({ comment, fineId, currentUser, isReply }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const deleteCommentMutation = useDeleteComment()
  const updateCommentMutation = useUpdateComment()

  const canEdit = currentUser?.id === comment.author_id
  const canReply = !isReply  // Only root comments can receive replies

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteCommentMutation.mutateAsync(comment.id)
      } catch (error) {
        console.error('Failed to delete comment:', error)
      }
    }
  }

  const handleEdit = async (content: string) => {
    try {
      await updateCommentMutation.mutateAsync({
        id: comment.id,
        content
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  if (comment.is_deleted) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground italic">
            [This comment was deleted]
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm">{comment.author_name}</span>
              <span className="text-xs text-muted-foreground">
                @{comment.author_username}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
                {comment.is_edited && ' (edited)'}
              </span>
            </div>
            
            {isEditing ? (
              <EditCommentForm
                initialContent={comment.content}
                onSave={handleEdit}
                onCancel={() => setIsEditing(false)}
                isLoading={updateCommentMutation.isPending}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-3">
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="h-6 px-2 text-xs"
                >
                  Reply
                </Button>
              )}
              
              {canEdit && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 px-2 text-xs"
                >
                  Edit
                </Button>
              )}
              
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteCommentMutation.isPending}
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                >
                  {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {isReplying && (
          <div className="mt-4">
            <ReplyForm
              fineId={fineId}
              parentId={comment.id}
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface EditCommentFormProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
  isLoading: boolean
}

function EditCommentForm({ initialContent, onSave, onCancel, isLoading }: EditCommentFormProps) {
  const [content, setContent] = useState(initialContent)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSave(content.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 text-sm border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[80px]"
        disabled={isLoading}
        autoFocus
      />
      <div className="flex items-center space-x-2">
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !content.trim() || content.trim() === initialContent}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

function CommentSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-20 h-4 bg-muted rounded animate-pulse" />
          <div className="w-12 h-3 bg-muted rounded animate-pulse" />
          <div className="w-16 h-3 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-muted rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2 mt-3">
          <div className="w-12 h-6 bg-muted rounded animate-pulse" />
          <div className="w-8 h-6 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export default CommentList