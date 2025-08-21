'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createFineSchema, fineTypeLabels, type CreateFineInput, type FineType } from '@/lib/validations/fines'
import { useCreateFine, useActiveUsers } from '@/hooks/fines/use-fines'

interface FineFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function FineForm({ onSuccess, onCancel }: FineFormProps) {
  const [selectedType, setSelectedType] = useState<FineType>('fine')
  const createFineMutation = useCreateFine()
  const { data: users, isLoading: usersLoading } = useActiveUsers()

  const form = useForm<CreateFineInput>({
    resolver: zodResolver(createFineSchema),
    defaultValues: {
      subject_id: '',
      fine_type: 'fine',
      amount: 0,
      description: '',
    },
  })

  const onSubmit = async (data: CreateFineInput) => {
    try {
      await createFineMutation.mutateAsync(data)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create fine:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Fine</CardTitle>
        <CardDescription>
          Add a fine, credit, or warning for a team member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Fine Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="flex gap-2">
              {(['fine', 'credit', 'warning'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={selectedType === type ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedType(type)
                    form.setValue('fine_type', type)
                  }}
                  className="flex-1"
                >
                  {fineTypeLabels[type]}
                </Button>
              ))}
            </div>
            {form.formState.errors.fine_type && (
              <p className="text-sm text-red-600">{form.formState.errors.fine_type.message}</p>
            )}
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <label htmlFor="subject_id" className="text-sm font-medium">
              Subject *
            </label>
            {usersLoading ? (
              <div className="flex items-center justify-center p-4 border rounded">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-sm">Loading users...</span>
              </div>
            ) : (
              <select
                id="subject_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register('subject_id')}
              >
                <option value="">Select a user...</option>
                {users?.data?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name} ({user.username})
                  </option>
                ))}
              </select>
            )}
            {form.formState.errors.subject_id && (
              <p className="text-sm text-red-600">{form.formState.errors.subject_id.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount {selectedType === 'warning' ? '' : '*'}
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max="10000"
              placeholder={selectedType === 'warning' ? '' : '0.00'}
              disabled={selectedType === 'warning'}
              className={selectedType === 'warning' ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
              value={selectedType === 'warning' ? '' : form.watch('amount') || ''}
              {...form.register('amount', { 
                valueAsNumber: true,
              })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <textarea
              id="description"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter description..."
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={createFineMutation.isPending}
              className="flex-1"
            >
              {createFineMutation.isPending ? 'Creating...' : 'Create Fine'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>

          {createFineMutation.error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              Failed to create fine. Please try again.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}