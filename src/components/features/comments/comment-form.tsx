'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createCommentSchema, type CreateCommentInput } from '@/lib/validations/comments'
import { useOptimisticCreateComment } from '@/hooks/comments/use-comments'
import { useAuthWithProfile } from '@/hooks/auth/use-auth-with-profile'

interface CommentFormProps {
  fineId: string
  parentId?: string | null
  placeholder?: string
  onSuccess?: () => void
  onCancel?: () => void
  autoFocus?: boolean
  compact?: boolean
}

export function CommentForm({ 
  fineId, 
  parentId = null, 
  placeholder = "Write your comment...",
  onSuccess, 
  onCancel,
  autoFocus = false,
  compact = false
}: CommentFormProps) {
  const [isExpanded, setIsExpanded] = useState(!compact || autoFocus)
  const createCommentMutation = useOptimisticCreateComment()
  const { user, profile } = useAuthWithProfile()

  const form = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      fine_id: fineId,
      parent_id: parentId,
      content: '',
    },
  })

  const onSubmit = async (data: CreateCommentInput) => {
    try {
      await createCommentMutation.mutateAsync(data)
      form.reset()
      onSuccess?.()
      if (compact) setIsExpanded(false)
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
    if (compact) setIsExpanded(false)
  }

  const handleFocus = () => {
    if (compact && !isExpanded) {
      setIsExpanded(true)
    }
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Please sign in to leave a comment.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (compact && !isExpanded) {
    return (
      <div className="w-full">
        <textarea
          placeholder={placeholder}
          className="w-full p-3 text-sm border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          rows={1}
          onFocus={handleFocus}
          readOnly
        />
      </div>
    )
  }

  return (
    <Card className="w-full">
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {parentId ? 'Reply' : 'Add Comment'}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-4" : ""}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  {!compact && <FormLabel>Comment</FormLabel>}
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder={placeholder}
                      className="w-full p-3 text-sm border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[100px]"
                      rows={compact ? 3 : 4}
                      autoFocus={autoFocus}
                      disabled={createCommentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  Commenting as {profile?.display_name || user.email}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {(onCancel || compact) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={createCommentMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={createCommentMutation.isPending || !form.watch('content')?.trim()}
                  className="min-w-[80px]"
                >
                  {createCommentMutation.isPending ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Simplified reply form for inline replies
export function ReplyForm({ 
  fineId, 
  parentId, 
  onSuccess, 
  onCancel 
}: {
  fineId: string
  parentId: string
  onSuccess?: () => void
  onCancel?: () => void
}) {
  return (
    <div className="mt-2 pl-4 border-l-2 border-muted">
      <CommentForm
        fineId={fineId}
        parentId={parentId}
        placeholder="Write a reply..."
        onSuccess={onSuccess}
        onCancel={onCancel}
        autoFocus
        compact
      />
    </div>
  )
}

export default CommentForm