'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FineThread } from './fine-thread'
import { FineForm } from './fine-form'
import { useFines } from '@/hooks/fines/use-fines'
import { useThreadedComments } from '@/hooks/comments/use-comments'
import { type FineType, type FineFilters } from '@/lib/validations/fines'
import { Fine } from '@/lib/supabase/queries/fines'
import { Comment, CommentWithReplies } from '@/lib/validations/comments'

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
  // State for managing UI interactions
  const [showForm, setShowForm] = useState(false) // Controls create fine form modal visibility
  const [selectedFine, setSelectedFine] = useState<string | null>(null) // Tracks which fine's thread is open
  const [filterText, setFilterText] = useState('') // Text input for filtering fines
  
  // Combine passed filters with default filter to exclude archived fines
  const queryFilters: FineFilters = {
    ...filters,
    is_archived: false // Only show active fines
  }

  // Fetch fines data from the database using custom hook
  const { data: finesData, isLoading, error } = useFines(queryFilters)

  // Set up keyboard handler to close fine thread modal with ESC key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedFine) {
        setSelectedFine(null) // Close the selected fine thread modal
      }
    }

    // Add event listener when component mounts
    document.addEventListener('keydown', handleEscapeKey)
    
    // Cleanup event listener when component unmounts or selectedFine changes
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [selectedFine])

  // Process and filter the fines data
  let fines = finesData?.data || [] // Get fines array, fallback to empty array
  
  // Sort fines chronologically with newest first
  fines = [...fines].sort((a, b) => {
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  })

  // Apply text search filter if user has entered search text
  if (filterText) {
    fines = fines.filter(fine => 
      fine.subject_name.toLowerCase().includes(filterText.toLowerCase()) ||
      fine.proposer_name.toLowerCase().includes(filterText.toLowerCase()) ||
      fine.description.toLowerCase().includes(filterText.toLowerCase())
    )
  }

  // Limit number of results if a limit was specified in props
  if (limit) {
    fines = fines.slice(0, limit)
  }

  // Group fines by date for organized display (used in compact mode)
  const finesByDate = fines.reduce((groups, fine) => {
    const date = new Date(fine.created_at || '')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Determine human-readable date label
    let dateKey: string
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday'
    } else {
      // Format as "Monday, January 15" for older dates
      dateKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }
    
    // Create new group if it doesn't exist
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    
    // Add fine to the appropriate date group
    groups[dateKey].push(fine)
    return groups
  }, {} as Record<string, Array<typeof fines[0]>>)

  // Handle error state - show error message if fines failed to load
  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Failed to load fines. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  // COMPACT MODE: Chat-like interface with grouped messages
  if (compact) {
    return (
      <div className="flex flex-col bg-white">
        {/* Header with title and search filter */}
        <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Channel-style icon */}
            <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
              #
            </div>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          {/* Real-time text filter input */}
          <input
            type="text"
            placeholder="Filter player..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Scrollable messages container */}
        <div className="overflow-y-auto p-4 space-y-1 max-h-[520px]">
          {/* Loading state: show skeleton placeholders while data loads */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <CompactFineSkeleton key={i} />
              ))}
            </div>
          ) : 
          /* Empty state: show message when no fines match filters */
          Object.entries(finesByDate).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No fines found</p>
              {/* Show create button if creation is enabled */}
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
            /* Render grouped fines by date */
            Object.entries(finesByDate as Record<string, Fine[]>).map(([date, dateFines]) => (
              <div key={date}>
                {/* Date separator bubble (Today, Yesterday, etc.) */}
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white border border-gray-300 rounded-full px-4 py-1 text-sm font-medium text-gray-700 shadow-sm">
                    {date}
                  </div>
                </div>

                {/* Render all fines for this date */}
                {dateFines.map((fine) => (
                  <CompactFineItem
                    key={fine.id}
                    fine={fine}
                    onClick={() => setSelectedFine(fine.id)} // Open thread modal on click
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Modal overlay for viewing selected fine's comment thread */}
        {selectedFine && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg">
              {/* Modal header with close button */}
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
              {/* Modal content - render the full fine thread */}
              <div className="p-4">
                <FineThread 
                  fine={fines.find(f => f.id === selectedFine)!} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal overlay for creating new fines */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <FineForm
                onSuccess={() => setShowForm(false)} // Close modal on successful creation
                onCancel={() => setShowForm(false)}  // Close modal if user cancels
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // STANDARD MODE: Card-based layout with full fine threads
  return (
    <div className="space-y-6">
      {/* Page header with title, description, and create button */}
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
              {/* Show create button only if enabled via props */}
              {showCreateForm && (
                <Button onClick={() => setShowForm(true)}>
                  Create Fine
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main content area - handles loading, empty, and populated states */}
      {isLoading ? (
        /* Loading state - show skeleton cards while data loads */
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <FineThreadSkeleton key={i} />
          ))}
        </div>
      ) : fines.length === 0 ? (
        /* Empty state - show message when no fines exist or match filters */
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
        /* Populated state - render each fine as a full thread component */
        <div className="space-y-4">
          {fines.map((fine) => (
            <FineThread
              key={fine.id}
              fine={fine}
            />
          ))}
        </div>
      )}

      {/* Modal overlay for creating new fines (standard mode) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <FineForm
              onSuccess={() => setShowForm(false)} // Close modal on successful creation
              onCancel={() => setShowForm(false)}  // Close modal if user cancels
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

interface Commenter {
  id: string
  name: string
  username: string
}

function CompactFineItem({ fine, onClick }: CompactFineItemProps) {
  // Fetch comments for this fine to show participant avatars and count
  const { data: comments } = useThreadedComments(fine.id)
  
  // Helper function to format timestamps in a chat-friendly way
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)

    // Return relative time for recent items, absolute time for older ones
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
    // For items older than a day, show the actual time
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

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

  // Extract unique commenters from the comment threads for avatar display
  const commenters = comments?.data ? 
    Array.from(new Set(comments.data.flatMap((thread: CommentWithReplies) => 
      // Flatten main comments and their replies into a single array
      [thread, ...(thread.replies || [])].map((comment: Comment) => ({
        id: comment.author_id,
        name: comment.author_name,
        username: comment.author_username
      }))
    ).map((commenter: Commenter) => JSON.stringify(commenter)))) // Stringify for Set deduplication
    .map((commenterStr: string) => JSON.parse(commenterStr)) // Parse back to objects
    .slice(0, 3) // Limit to 3 avatars to prevent UI overflow
    : []

  // Count top-level comments (not including replies)
  const commentCount = comments?.data?.length || 0

  return (
    <div className={`group hover:bg-gray-50 -mx-4 px-4 py-1 rounded border-b border-gray-300`}>
      <div className="flex space-x-3">
        {/* User avatar with initials */}
        <div className={`w-9 h-9 rounded-lg ${getAvatarColor(fine.proposer_name)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
          {/* Extract and display first letter(s) from name */}
          {fine.proposer_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
        </div>

        {/* Main message content area */}
        <div className="flex-1 min-w-0">
          {/* Message header with name and timestamp */}
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-gray-900">{fine.proposer_name}</span>
            <span className="text-xs text-gray-500">{formatTime(fine.created_at)}</span>
          </div>

          {/* Fine information display */}
          <div className="mt-0.5">
            <div className="text-sm text-gray-900 leading-tight">
              {/* Format fine amount based on type and value */}
              {fine.amount === 0
                ? "Fine Warning"
                : fine.fine_type === "credit"
                  ? `FC $${fine.amount}` // Fine credit
                  : `$${fine.amount}`    // Regular fine
              } {fine.subject_name} - {fine.description}
            </div>
          </div>

          {/* Interactive comment section - shows when comments exist */}
          {commentCount > 0 && (
            <button
              onClick={onClick}
              className="mt-1 flex items-center space-x-2 text-xs text-blue-600 hover:underline cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 transition-colors"
            >
              <span>▶</span> {/* Thread expansion indicator */}
              <span>
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </span>
              {/* Display mini avatars of people who have commented */}
              {commenters.length > 0 && (
                <div className="flex space-x-1 ml-1">
                  {commenters.map((commenter: Commenter) => (
                    <div
                      key={commenter.id}
                      className={`w-4 h-4 rounded ${getAvatarColor(commenter.name, 'commenter')} flex items-center justify-center text-white text-xs font-medium border border-white`}
                      title={commenter.name} // Tooltip on hover
                    >
                      {commenter.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </button>
          )}

          {/* Subtle prompt to add first comment - only visible on hover */}
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

// Loading skeleton for compact fine items - mimics the actual layout
function CompactFineSkeleton() {
  return (
    <div className="p-3 rounded-lg">
      <div className="flex items-start space-x-3">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          {/* Name and timestamp placeholders */}
          <div className="flex items-center space-x-2">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* Fine details placeholders */}
          <div className="flex items-center space-x-2">
            <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* Description placeholder */}
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Loading skeleton for standard mode fine threads - mimics card layout
function FineThreadSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header information placeholders */}
          <div className="flex items-center space-x-3">
            <div className="w-24 h-4 bg-muted rounded animate-pulse" /> {/* Proposer name */}
            <div className="w-16 h-6 bg-muted rounded animate-pulse" /> {/* Fine amount */}
            <div className="w-12 h-4 bg-muted rounded animate-pulse" /> {/* Subject name */}
            <div className="w-16 h-3 bg-muted rounded animate-pulse" /> {/* Timestamp */}
          </div>
          
          {/* Fine description placeholders */}
          <div className="space-y-2">
            <div className="w-32 h-4 bg-muted rounded animate-pulse" />
            <div className="w-full h-4 bg-muted rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Action buttons placeholders */}
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