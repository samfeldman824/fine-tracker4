'use client'

import { createClient } from '@/lib/supabase/client'
import { createContext, useContext } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }

  return context.supabase
}