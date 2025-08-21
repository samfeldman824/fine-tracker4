'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/features/auth/protected-route'
import { LogoutButton } from '@/components/features/auth/logout-button'
import { FineForm, FineList } from '@/components/features/fines'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinesSummary } from '@/hooks/fines/use-fines'
import { useRecentComments } from '@/hooks/comments/use-comments'

export default function DashboardPage() {
  const [showFineForm, setShowFineForm] = useState(false)
  const { data: summary, isLoading: summaryLoading } = useFinesSummary()
  const { data: recentComments, isLoading: commentsLoading } = useRecentComments(8)

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Summary Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Fines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.data?.total_fines || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.data?.total_credits || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Total Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? '...' : summary?.data?.total_warnings || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summaryLoading ? '...' : (summary?.data?.net_amount || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with actions and recent comments */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowFineForm(true)}
                  className="w-full"
                >
                  Create New Fine
                </Button>
                <Button variant="outline" className="w-full">
                  View All Fines
                </Button>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Recent Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
                <CardDescription>Latest replies</CardDescription>
              </CardHeader>
              <CardContent>
                {commentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : recentComments?.data && recentComments.data.length > 0 ? (
                  <div className="space-y-2">
                    {recentComments.data.slice(0, 5).map((comment) => (
                      <div key={comment.id} className="p-2 bg-gray-50 hover:bg-gray-100 rounded text-xs cursor-pointer transition-colors">
                        <div className="font-medium truncate">
                          {comment.author_name}: {comment.content.slice(0, 50)}...
                        </div>
                        <div className="text-gray-500 truncate">
                          {comment.fines?.subject_name} • {new Date(comment.created_at || '').toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">No recent comments</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main content - Fine List with integrated comments */}
          <div className="lg:col-span-3">
            <FineList 
              showCreateForm={false}
              limit={10}
              title="Fines"
              description="Latest fines with their comment threads - just like Slack!"
              compact={true}
            />
          </div>
        </div>

        {/* Fine Form Modal */}
        {showFineForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <FineForm
                onSuccess={() => setShowFineForm(false)}
                onCancel={() => setShowFineForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}