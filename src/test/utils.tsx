import * as React from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add provider props here if needed (e.g., initialState, theme, etc.)
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Add any global providers here (ThemeProvider, QueryClientProvider, etc.) */}
      {children}
    </>
  )
}

export function customRender(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Helper to wait for loading states to finish
export async function waitForLoadingToFinish() {
  // Wait for a short time to let React updates settle
  await new Promise(resolve => setTimeout(resolve, 100))
}

// Test data factories
export const testData = {
  user: (overrides?: Partial<TestUser>) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  }),

  property: (overrides?: Partial<TestProperty>) => ({
    id: '1',
    name: 'Test Property',
    address: '123 Test St',
    units: 10,
    ...overrides,
  }),

  tenant: (overrides?: Partial<TestTenant>) => ({
    id: '1',
    name: 'Test Tenant',
    email: 'tenant@example.com',
    phone: '555-0100',
    ...overrides,
  }),
}

// Type definitions for test data
export interface TestUser {
  id: string
  name: string
  email: string
}

export interface TestProperty {
  id: string
  name: string
  address: string
  units: number
}

export interface TestTenant {
  id: string
  name: string
  email: string
  phone: string
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { customRender as render }
