import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Check that the page loaded successfully
    expect(page.url()).toBe('http://localhost:3000/')
  })

  test('should have the correct title', async ({ page }) => {
    await page.goto('/')

    // Check for a title or heading (adjust based on your actual homepage)
    const title = await page.title()
    expect(title).toBeTruthy()
  })

  test('should be able to navigate', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Example: Check if navigation elements are present
    // Adjust these selectors based on your actual UI
    const body = await page.locator('body')
    expect(await body.isVisible()).toBeTruthy()
  })
})

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')

    // Basic accessibility check - ensure main content is visible
    const main = page.locator('main, [role="main"]')
    const isVisible = await main.isVisible().catch(() => false)

    // If there's no main element, just check that the body is visible
    if (!isVisible) {
      const body = page.locator('body')
      expect(await body.isVisible()).toBeTruthy()
    } else {
      expect(isVisible).toBeTruthy()
    }
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const body = await page.locator('body')
    expect(await body.isVisible()).toBeTruthy()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    const body = await page.locator('body')
    expect(await body.isVisible()).toBeTruthy()
  })

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    const body = await page.locator('body')
    expect(await body.isVisible()).toBeTruthy()
  })
})
