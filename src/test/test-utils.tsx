import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock providers for testing
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const MockQueryProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockQueryProvider>
      <MockAuthProvider>
        {children}
      </MockAuthProvider>
    </MockQueryProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }