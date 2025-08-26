import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global mocks that work universally
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

// Mock window objects
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true,
})

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
}