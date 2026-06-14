import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })

  test('home page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
  })
})
