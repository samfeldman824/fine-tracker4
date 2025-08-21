import { z } from 'zod'

// Fine type enum schema
export const fineTypeSchema = z.enum(['fine', 'credit', 'warning'])

// Base fine schema
export const fineSchema = z.object({
  id: z.string().uuid(),
  subject_id: z.string().uuid(),
  proposer_id: z.string().uuid(),
  subject_name: z.string().min(1, 'Subject name is required'),
  proposer_name: z.string().min(1, 'Proposer name is required'),
  fine_type: fineTypeSchema,
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  comment_count: z.number().int().min(0).default(0),
  is_archived: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
})

// Create fine schema (without auto-generated fields)
export const createFineSchema = z.object({
  subject_id: z.string().uuid('Please select a valid user'),
  fine_type: fineTypeSchema,
  amount: z.number().min(0, 'Amount must be positive').max(10000, 'Amount too large'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
})

// Update fine schema
export const updateFineSchema = createFineSchema.partial().extend({
  id: z.string().uuid(),
})

// Fine filters schema
export const fineFiltersSchema = z.object({
  fine_type: fineTypeSchema.optional(),
  subject_id: z.string().uuid().optional(),
  proposer_id: z.string().uuid().optional(),
  is_archived: z.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
})

// Types
export type Fine = z.infer<typeof fineSchema>
export type CreateFineInput = z.infer<typeof createFineSchema>
export type UpdateFineInput = z.infer<typeof updateFineSchema>
export type FineFilters = z.infer<typeof fineFiltersSchema>
export type FineType = z.infer<typeof fineTypeSchema>

// Fine type display names
export const fineTypeLabels: Record<FineType, string> = {
  fine: 'Fine',
  credit: 'Credit',
  warning: 'Warning',
}

// Fine type colors for UI
export const fineTypeColors: Record<FineType, string> = {
  fine: 'text-red-600 bg-red-50',
  credit: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
}
