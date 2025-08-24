'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CommentForm } from '@/components/features/comments/comment-form'
import { useThreadedComments, useDeleteComment, useUpdateComment } from '@/hooks/comments/use-comments'
import { useRealtimeComments } from '@/hooks/comments/use-realtime-comments'
import { useAuthWithProfile } from '@/hooks/auth/use-auth-with-profile'
import { fineTypeLabels, fineTypeColors, type FineType } from '@/lib/validations/fines'
import type { Comment } from '@/lib/validations/comments'

interface FineThreadProps {
  fine: {
    id: string
    subject_name: string
    proposer_name: string
    fine_type: FineType
    amount: number
    description: string
    comment_count: number
    created_at: string
    is_archived: boolean
  }
}

export function FineThread({ fine }: FineThreadProps) {
  const { user } = useAuthWithProfile()
  const { data: commentsData, isLoading: commentsLoading } = useThreadedComments(fine.id)
  
  const [showComments, setShowComments] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  
  // Setup real-time updates for this fine's comments
  useRealtimeComments({
    fineId: fine.id,
    enabled: true, // Always enabled to catch new comments
  })

  const comments = commentsData?.data || []
  const hasComments = comments.length > 0
  
  // Auto-show comments when they are loaded and exist
  useEffect(() => {
    if (hasComments && !commentsLoading) {
      setShowComments(true)
    }
  }, [hasComments, commentsLoading])

  const formatDate = (dateString: string) => {
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

  const actualCommentCount = comments.length

  // Generate consistent avatar colors based on user names using a hash function
  const getAvatarColor = (name: string, seed = '') => {
    // Available avatar background colors
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-lime-500',
      'bg-rose-500',
      'bg-amber-500',
      'bg-emerald-500',
      'bg-violet-500',
      'bg-sky-500'
    ]
    
    // Create input string from name and optional seed for consistent hashing
    const input = (name.trim() + seed).toLowerCase()
    let hash = 0
    
    // DJB2 hash algorithm - produces good distribution across color range
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 33) ^ input.charCodeAt(i)
    }
    
    // Convert hash to valid array index and return corresponding color
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  return (
    <div className="space-y-2">
      {/* Main Fine Card - Acts like the main Slack message */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Fine Header */}
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-medium text-sm">{fine.proposer_name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${fineTypeColors[fine.fine_type]}`}>
                  {fineTypeLabels[fine.fine_type]}
                </span>
                <span className="text-sm font-medium">${fine.amount.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(fine.created_at)}
                </span>
              </div>

              {/* Fine Content */}
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">
                  Fined: <span className="text-foreground">{fine.subject_name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {fine.description}
                </p>
              </div>

              {/* Action Bar - Similar to Slack's reaction/reply bar */}
              <div className="flex items-center space-x-4 pt-2 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reply
                </Button>
                
                {hasComments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showComments ? '🔽' : '▶️'} 
                    {actualCommentCount} {actualCommentCount === 1 ? 'reply' : 'replies'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Reply Form */}
          {isReplying && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <CommentForm
                fineId={fine.id}
                placeholder={`Reply to ${fine.proposer_name}...`}
                onSuccess={() => {
                  setIsReplying(false)
                  setShowComments(true) // Auto-show comments when user adds one
                }}
                onCancel={() => setIsReplying(false)}
                autoFocus
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Thread - Like Slack's thread view */}
      {showComments && (
        <div className="ml-8 border-l-2 border-muted pl-4 space-y-3">
          {/* Thread Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {actualCommentCount} {actualCommentCount === 1 ? 'reply' : 'replies'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(false)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <CommentSkeleton key={i} />
              ))}
            </div>
          ) : hasComments ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={user}
                  getAvatarColor={getAvatarColor}
                />
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No replies yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(true)}
                className="mt-2 text-xs"
              >
                Be the first to reply
              </Button>
            </div>
          )}

          {/* Thread Reply Form */}
          {!isReplying && hasComments && (
            <div className="pt-2">
              <CommentForm
                fineId={fine.id}
                placeholder="Reply to thread..."
                compact
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUser: any
  getAvatarColor: (name: string, seed?: string) => string
}

function CommentItem({ comment, currentUser, getAvatarColor }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  
  const deleteCommentMutation = useDeleteComment()
  const updateCommentMutation = useUpdateComment()

  // Reset error state when starting to edit
  const handleStartEdit = () => {
    updateCommentMutation.reset()
    setIsEditing(true)
  }

  const canEdit = currentUser?.id === comment.author_id

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
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
      // Don't close the form on error, let the user try again
      // The error will be handled by the mutation and shown in the UI
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    
    return date.toLocaleDateString()
  }

  if (comment.is_deleted) {
    return (
      <div className="p-3 bg-muted/30 rounded text-sm text-muted-foreground italic">
        This message was deleted
      </div>
    )
  }

  return (
    <div className="group hover:bg-muted/30 rounded p-2 -m-2 transition-colors">
      <div className="flex items-start space-x-3">
        {/* Avatar placeholder */}
        <div className={`w-8 h-8 ${getAvatarColor(comment.author_name)} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span className="text-xs font-medium text-white">
            {comment.author_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at || '')}
              {comment.is_edited && ' (edited)'}
            </span>
          </div>

          {/* Comment Content */}
          {isEditing ? (
            <EditCommentForm
              initialContent={comment.content}
              onSave={handleEdit}
              onCancel={() => setIsEditing(false)}
              isLoading={updateCommentMutation.isPending}
              error={updateCommentMutation.isError}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Comment Actions */}
          {canEdit && !isEditing && (
            <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                disabled={updateCommentMutation.isPending}
                className="h-6 px-2 text-xs"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteCommentMutation.isPending}
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              >
                {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}

          {/* Show error message if update failed */}
          {updateCommentMutation.isError && (
            <div className="mt-2 text-xs text-destructive">
              Failed to save changes. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface EditCommentFormProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
  isLoading: boolean
  error?: boolean
}

function EditCommentForm({ initialContent, onSave, onCancel, isLoading, error }: EditCommentFormProps) {
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
        className={`w-full p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[60px] ${
          error ? 'border-destructive' : 'border-input'
        }`}
        disabled={isLoading}
        autoFocus
      />
      {error && (
        <div className="text-xs text-destructive">
          Failed to save changes. Please try again.
        </div>
      )}
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
    <div className="flex items-start space-x-3 p-2">
      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-20 h-4 bg-muted rounded animate-pulse" />
          <div className="w-12 h-3 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="w-full h-4 bg-muted rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default FineThread