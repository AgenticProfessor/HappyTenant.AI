import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add provider props here if needed (e.g., initialState, theme, etc.)
}

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Add any global providers here (ThemeProvider, QueryClientProvider, etc.) */}
      {children}
    </>
  )
}

export function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Helper to wait for loading states to finish
export async function waitForLoadingToFinish() {
  const { waitForElementToBeRemoved } = await import('@testing-library/react')
  await waitForElementToBeRemoved(
    () => document.querySelector('[data-loading="true"]'),
    { timeout: 3000 }
  ).catch(() => {
    // If no loading element found, that's fine
  })
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

// Helper for testing forms
export async function fillForm(fields: Record<string, string>) {
  const { screen } = await import('@testing-library/react')
  const userEvent = (await import('@testing-library/user-event')).default

  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(new RegExp(label, 'i'))
    await userEvent.clear(input)
    await userEvent.type(input, value)
  }
}

export async function submitForm(buttonText = /submit/i) {
  const { screen } = await import('@testing-library/react')
  const userEvent = (await import('@testing-library/user-event')).default

  const submitButton = screen.getByRole('button', { name: buttonText })
  await userEvent.click(submitButton)
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
