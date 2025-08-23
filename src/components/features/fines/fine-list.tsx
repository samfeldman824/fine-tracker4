'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FineThread } from './fine-thread'
import { FineForm } from './fine-form'
import { useFines } from '@/hooks/fines/use-fines'
import { useThreadedComments } from '@/hooks/comments/use-comments'
import { fineTypeLabels, fineTypeColors, type FineType, type FineFilters } from '@/lib/validations/fines'
import { Fine } from '@/lib/supabase/queries/fines'

interface FineListProps {
  showCreateForm?: boolean
  filters?: FineFilters
  limit?: number
  title?: string
  description?: string
  compact?: boolean
}

export function FineList({ 
  showCreateForm = false, 
  filters,
  limit,
  title = "Fines",
  description = "Team fines with their comment threads",
  compact = false
}: FineListProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedFine, setSelectedFine] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')
  
  // Apply local filters to the query
  const queryFilters: FineFilters = {
    ...filters,
    is_archived: false // Only show active fines
  }

  const { data: finesData, isLoading, error } = useFines(queryFilters)

  // Sort and limit fines
  let fines = finesData?.data || []
  
  // Sort by newest first (most recent activity)
  fines = [...fines].sort((a, b) => {
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  })

  // Apply text filter
  if (filterText) {
    fines = fines.filter(fine => 
      fine.subject_name.toLowerCase().includes(filterText.toLowerCase()) ||
      fine.proposer_name.toLowerCase().includes(filterText.toLowerCase()) ||
      fine.description.toLowerCase().includes(filterText.toLowerCase())
    )
  }

  // Apply limit if specified
  if (limit) {
    fines = fines.slice(0, limit)
  }

  // Group fines by date
  const finesByDate = fines.reduce((groups, fine) => {
    const date = new Date(fine.created_at || '')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    let dateKey: string
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday'
    } else {
      dateKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(fine)
    return groups
  }, {} as Record<string, Array<typeof fines[0]>>)

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Failed to load fines. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-col bg-white">
        {/* Header */}
        <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
              #
            </div>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <input
            type="text"
            placeholder="Filter player..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Messages Container */}
        <div className="overflow-y-auto p-4 space-y-1 max-h-[520px]">
          {/* Loading state: show skeletons while loading */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <CompactFineSkeleton key={i} />
              ))}
            </div>
          ) : 
          /* Empty state: no fines found */
          Object.entries(finesByDate).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No fines found</p>
              {showCreateForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  className="mt-2"
                >
                  Create the first fine
                </Button>
              )}
            </div>
          ) : (
            /* Fines list */
            Object.entries(finesByDate as Record<string, Fine[]>).map(([date, dateFines]) => (
              <div key={date}>
                {/* Date Divider */}
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white border border-gray-300 rounded-full px-4 py-1 text-sm font-medium text-gray-700 shadow-sm">
                    {date}
                  </div>
                </div>

                {/* Messages for this date */}
                {dateFines.map((fine) => (
                  <CompactFineItem
                    key={fine.id}
                    fine={fine}
                    onClick={() => setSelectedFine(fine.id)}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Selected Fine Thread Modal */}
        {selectedFine && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Fine Thread</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFine(null)}
                  className="text-slate-500"
                >
                  ✕
                </Button>
              </div>
              <div className="p-4">
                <FineThread 
                  fine={fines.find(f => f.id === selectedFine)!} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Create Fine Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <FineForm
                onSuccess={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {showCreateForm && (
                <Button onClick={() => setShowForm(true)}>
                  Create Fine
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Fines List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <FineThreadSkeleton key={i} />
          ))}
        </div>
      ) : fines.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">No fines found</p>
              {showCreateForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                >
                  Create the first fine
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fines.map((fine) => (
            <FineThread
              key={fine.id}
              fine={fine}
            />
          ))}
        </div>
      )}

      {/* Create Fine Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <FineForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface CompactFineItemProps {
  fine: {
    id: string
    subject_name: string
    proposer_name: string
    fine_type: FineType
    amount: number
    description: string
    comment_count: number
    created_at: string
  }
  onClick: () => void
}

function CompactFineItem({ fine, onClick }: CompactFineItemProps) {
  // Load comment data to get commenter avatars
  const { data: comments } = useThreadedComments(fine.id)
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Get avatar color based on name with better distribution
  const getAvatarColor = (name: string, seed = '') => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
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
    
    // Use a more sophisticated hash function for better color distribution
    const input = (name.trim() + seed).toLowerCase()
    let hash = 0
    
    // DJB2 hash algorithm for better distribution
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 33) ^ input.charCodeAt(i)
    }
    
    // Ensure positive number and get index
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Get unique commenters for avatars
  const commenters = comments?.data ? 
    Array.from(new Set(comments.data.flatMap((thread: any) => 
      [thread, ...(thread.replies || [])].map((comment: any) => ({
        id: comment.author_id,
        name: comment.author_name,
        username: comment.author_username
      }))
    ).map((commenter: any) => JSON.stringify(commenter))))
    .map((commenterStr: string) => JSON.parse(commenterStr))
    .slice(0, 3) // Show max 3 avatars
    : []

  const commentCount = comments?.data?.length || 0

  return (
    <div className={`group hover:bg-gray-50 -mx-4 px-4 py-1 rounded border-b border-gray-300`}>
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-lg ${getAvatarColor(fine.proposer_name)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
          {fine.proposer_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-gray-900">{fine.proposer_name}</span>
            <span className="text-xs text-gray-500">{formatTime(fine.created_at)}</span>
          </div>

          {/* Fine Details */}
          <div className="mt-0.5">
            <div className="text-sm text-gray-900 leading-tight">
              {fine.amount === 0
                ? "Fine Warning"
                : fine.fine_type === "credit"
                  ? `FC $${fine.amount}`
                  : `$${fine.amount}`
              } {fine.subject_name} - {fine.description}
            </div>
          </div>

          {/* Comments indicator */}
          {commentCount > 0 && (
            <button
              onClick={onClick}
              className="mt-1 flex items-center space-x-2 text-xs text-blue-600 hover:underline cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
            >
              <span>▶</span>
              <span>
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </span>
              {/* Show participant avatars if there are commenters */}
              {commenters.length > 0 && (
                <div className="flex -space-x-1 ml-1">
                  {commenters.map((commenter: any) => (
                    <div
                      key={commenter.id}
                      className={`w-4 h-4 rounded ${getAvatarColor(commenter.name, 'commenter')} flex items-center justify-center text-white text-xs font-medium border border-white`}
                      title={commenter.name}
                    >
                      {commenter.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </button>
          )}

          {/* Add comment button for fines without comments */}
          {commentCount === 0 && (
            <button
              onClick={onClick}
              className="mt-1 text-xs text-gray-500 hover:text-blue-600 hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Add comment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CompactFineSkeleton() {
  return (
    <div className="p-3 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function FineThreadSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center space-x-3">
            <div className="w-24 h-4 bg-muted rounded animate-pulse" />
            <div className="w-16 h-6 bg-muted rounded animate-pulse" />
            <div className="w-12 h-4 bg-muted rounded animate-pulse" />
            <div className="w-16 h-3 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="w-32 h-4 bg-muted rounded animate-pulse" />
            <div className="w-full h-4 bg-muted rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Actions skeleton */}
          <div className="flex items-center space-x-4 pt-2 border-t border-muted">
            <div className="w-12 h-6 bg-muted rounded animate-pulse" />
            <div className="w-16 h-6 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FineList