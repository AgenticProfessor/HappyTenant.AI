# Testing Guide

This document describes the testing infrastructure for the Happy Tenant application.

## Overview

The project uses two testing frameworks:

- **Vitest** for unit and integration tests
- **Playwright** for end-to-end (E2E) tests

## Quick Start

### Running Unit Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Running E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

## Project Structure

```
├── e2e/                          # E2E test files
│   └── example.spec.ts
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── __tests__/        # Component unit tests
│   │           ├── button.test.tsx
│   │           ├── input.test.tsx
│   │           └── card.test.tsx
│   └── test/
│       ├── setup.ts              # Test setup and global mocks
│       └── utils.tsx             # Test utilities and helpers
├── vitest.config.ts              # Vitest configuration
└── playwright.config.ts          # Playwright configuration
```

## Unit Testing with Vitest

### Writing Tests

Tests should be placed in `__tests__` directories next to the code they test, with the `.test.ts` or `.test.tsx` extension.

Example:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Button } from '../button'

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
```

### Test Utilities

The project provides custom test utilities in `/src/test/utils.tsx`:

- **Custom render**: Wraps components with necessary providers
- **Test data factories**: Generate test data
- **Form helpers**: `fillForm()`, `submitForm()`
- **Async helpers**: `waitForLoadingToFinish()`

Example usage:
```typescript
import { render, screen, testData } from '@/test/utils'

const user = testData.user({ name: 'John Doe' })
```

### Available Matchers

The project uses `@testing-library/jest-dom` which provides useful matchers:

- `toBeInTheDocument()`
- `toHaveClass(className)`
- `toHaveAttribute(attr, value)`
- `toBeDisabled()`
- `toHaveFocus()`
- And many more...

### Mocked Modules

The following modules are automatically mocked in `/src/test/setup.ts`:

- `next/navigation` - Router hooks
- `next/image` - Next.js Image component
- `ResizeObserver`
- `IntersectionObserver`
- `matchMedia`

## E2E Testing with Playwright

### Writing E2E Tests

E2E tests should be placed in the `/e2e` directory with the `.spec.ts` extension.

Example:
```typescript
import { test, expect } from '@playwright/test'

test('should load the homepage', async ({ page }) => {
  await page.goto('/')
  expect(page.url()).toBe('http://localhost:3000/')
})
```

### Playwright Configuration

The project is configured to test on:

- Chromium (Desktop)
- Firefox (Desktop)
- WebKit (Desktop)
- Mobile Chrome
- Mobile Safari

Tests automatically start a development server on `http://localhost:3000` before running.

### Debugging E2E Tests

```bash
# Run with UI mode (recommended for debugging)
npm run test:e2e:ui

# Run in headed mode (see the browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/example.spec.ts

# Run in debug mode
npx playwright test --debug
```

## Coverage

To generate a coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in the `/coverage` directory and include:
- HTML report (viewable in browser)
- JSON report
- Text summary

Coverage is configured to exclude:
- `node_modules/`
- `src/test/`
- Type definition files
- Config files
- `.next/`
- `e2e/`

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
   - Focus on what the component does, not how it does it
   - Test user interactions and visible output

2. **Use semantic queries**
   - Prefer `getByRole`, `getByLabelText` over `getByTestId`
   - This makes tests more accessible and resilient

3. **Keep tests isolated**
   - Each test should be independent
   - Don't rely on test execution order

4. **Use descriptive test names**
   - Test names should describe what is being tested
   - Use `it('should...')` format

### E2E Tests

1. **Test critical user journeys**
   - Focus on the most important user flows
   - Don't test every edge case (that's what unit tests are for)

2. **Use stable selectors**
   - Prefer semantic selectors (role, label, text)
   - Avoid CSS selectors that might change

3. **Handle async operations**
   - Always wait for network idle or specific elements
   - Use appropriate timeouts

4. **Keep tests independent**
   - Each test should set up its own state
   - Don't rely on previous tests

## CI/CD Integration

The testing setup is CI-ready. For CI environments:

- Vitest runs in headless mode by default
- Playwright retries failing tests twice in CI
- Screenshots and traces are captured on failure

Example GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run unit tests
  run: npm test -- --run

- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Tests failing due to missing dependencies

```bash
npm install
```

### Playwright browsers not installed

```bash
npx playwright install
```

### Port 3000 already in use

Either stop the process using port 3000, or change the port in `playwright.config.ts`:

```typescript
use: {
  baseURL: 'http://localhost:3001',
}
```

### Module not found errors

Make sure your path aliases in `vitest.config.ts` match those in `tsconfig.json`.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
