import { createClient } from '@/lib/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/types'
import type { FineFilters } from '@/lib/validations/fines'

export type Fine = Tables<'fines'>
export type InsertFine = TablesInsert<'fines'>
export type UpdateFine = TablesUpdate<'fines'>

// Get all fines with optional filters
export async function getFines(filters?: FineFilters) {
  const supabase = createClient()
  let query = supabase
    .from('fines')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.fine_type) {
    query = query.eq('fine_type', filters.fine_type)
  }
  
  if (filters?.subject_id) {
    query = query.eq('subject_id', filters.subject_id)
  }
  
  if (filters?.proposer_id) {
    query = query.eq('proposer_id', filters.proposer_id)
  }
  
  if (filters?.is_archived !== undefined) {
    query = query.eq('is_archived', filters.is_archived)
  }
  
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from)
  }
  
  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to)
  }
  
  if (filters?.search) {
    query = query.or(`description.ilike.%${filters.search}%,subject_name.ilike.%${filters.search}%,proposer_name.ilike.%${filters.search}%`)
  }

  return query
}

// Get a single fine by ID
export async function getFine(id: string) {
  const supabase = createClient()
  return supabase
    .from('fines')
    .select('*')
    .eq('id', id)
    .single()
}

// Create a new fine
export async function createFine(fine: InsertFine) {
  const supabase = createClient()
  return supabase
    .from('fines')
    .insert(fine)
    .select()
    .single()
}

// Update a fine
export async function updateFine(id: string, updates: UpdateFine) {
  const supabase = createClient()
  return supabase
    .from('fines')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

// Delete a fine
export async function deleteFine(id: string) {
  const supabase = createClient()
  return supabase
    .from('fines')
    .delete()
    .eq('id', id)
}

// Archive/unarchive a fine
export async function toggleArchiveFine(id: string, is_archived: boolean) {
  const supabase = createClient()
  return supabase
    .from('fines')
    .update({ is_archived })
    .eq('id', id)
    .select()
    .single()
}

// Get fines summary/stats
export async function getFinesSummary() {
  const supabase = createClient()
  
  // Get total counts and amounts by type
  const { data, error } = await supabase
    .from('fines')
    .select('fine_type, amount, is_archived')
    .eq('is_archived', false)

  if (error) throw error

  // Calculate summary stats
  const summary = {
    total_fines: 0,
    total_credits: 0,
    total_warnings: 0,
    total_amount: 0,
    net_amount: 0
  }

  data?.forEach(fine => {
    if (fine.fine_type === 'fine') {
      summary.total_fines++
      summary.total_amount += fine.amount
      summary.net_amount += fine.amount
    } else if (fine.fine_type === 'credit') {
      summary.total_credits++
      summary.net_amount -= fine.amount
    } else if (fine.fine_type === 'warning') {
      summary.total_warnings++
    }
  })

  return { data: summary, error: null }
}

// Get recent fines (for dashboard)
export async function getRecentFines(limit = 5) {
  const supabase = createClient()
  return supabase
    .from('fines')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(limit)
}

// Get user by ID for fine creation
export async function getUser(userId: string) {
  const supabase = createClient()
  return supabase
    .from('users')
    .select('id, username, display_name, email')
    .eq('id', userId)
    .single()
}

// Get all active users for dropdown/selection
export async function getActiveUsers() {
  const supabase = createClient()
  return supabase
    .from('users')
    .select('id, username, display_name, email')
    .eq('is_active', true)
    .order('display_name', { ascending: true })
}