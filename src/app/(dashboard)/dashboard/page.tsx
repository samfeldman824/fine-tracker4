'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/features/auth/protected-route'
import { LogoutButton } from '@/components/features/auth/logout-button'
import { FineForm } from '@/components/features/fines/fine-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinesSummary, useRecentFines } from '@/hooks/fines/use-fines'
import { fineTypeLabels, fineTypeColors, type FineType } from '@/lib/validations/fines'

export default function DashboardPage() {
  const [showFineForm, setShowFineForm] = useState(false)
  const { data: summary, isLoading: summaryLoading } = useFinesSummary()
  const { data: recentFines, isLoading: recentLoading } = useRecentFines()

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common actions for managing fines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest fines and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : recentFines?.data && recentFines.data.length > 0 ? (
                <div className="space-y-3">
                  {recentFines.data.map((fine) => (
                    <div key={fine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${fineTypeColors[fine.fine_type as FineType]}`}>
                            {fineTypeLabels[fine.fine_type as FineType]}
                          </span>
                          <span className="text-sm font-medium">${fine.amount.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {fine.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {fine.subject_name} • {new Date(fine.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
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