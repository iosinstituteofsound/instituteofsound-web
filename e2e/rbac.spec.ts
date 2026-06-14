import { test, expect } from '@playwright/test'

test.describe('RBAC', () => {
  test('403 page renders', async ({ page }) => {
    await page.goto('/403')
    await expect(page.getByRole('heading', { name: '403' })).toBeVisible()
    await expect(page.getByText(/do not have permission/i)).toBeVisible()
  })

  test('protected route redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
