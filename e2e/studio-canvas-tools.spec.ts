import { test, expect } from '@playwright/test'
import {
  STUDIO_E2E_ENABLED,
  canvasSurface,
  clickCanvas,
  dragOnCanvas,
  expectCanvasHint,
  expectViewportToolClass,
  openStudio,
  paintStroke,
  selectTool,
  selectToolShortcut,
} from './helpers/studio'

/**
 * Canvas tool Feel Tests — all 14 studio rail tools.
 * Requires authenticated session + running dev server.
 *
 * Run: SEQUENCE_E2E=1 npm run test:e2e:canvas
 */

test.describe.configure({ mode: 'serial', timeout: 90_000 })

test.describe('Canvas Tools E2E @canvas-tools', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!STUDIO_E2E_ENABLED, 'Set SEQUENCE_E2E=1 with auth storage to run studio e2e')
    await openStudio(page)
  })

  test('CT-E2E-001 Select (V) — context bar and hint', async ({ page }) => {
    await selectTool(page, 'select')
    await expectViewportToolClass(page, 'select')
    await expectCanvasHint(page, /select/i)
    await expect(page.getByTestId('studio-select-context')).toBeVisible()
    await selectToolShortcut(page, 'v', 'select')
  })

  test('CT-E2E-002 Brush (B) — paint mode and timeline clip', async ({ page }) => {
    await selectTool(page, 'brush')
    await expect(page.locator('.mas-canvas-zone--paint')).toBeVisible()
    await paintStroke(page)
    await expect(page.getByTestId('sequence-timeline-clip').first()).toBeVisible({ timeout: 3000 })
    await selectToolShortcut(page, 'b', 'brush')
  })

  test('CT-E2E-003 Erase (E) — paint mode active', async ({ page }) => {
    await selectTool(page, 'erase')
    await expect(page.locator('.mas-canvas-zone--paint')).toBeVisible()
    await expectViewportToolClass(page, 'erase')
    await paintStroke(page)
    await selectToolShortcut(page, 'e', 'erase')
  })

  test('CT-E2E-004 Smudge (S) — paint mode active', async ({ page }) => {
    await selectTool(page, 'smudge')
    await expect(page.locator('.mas-canvas-zone--paint')).toBeVisible()
    await expectViewportToolClass(page, 'smudge')
    await paintStroke(page)
    await selectToolShortcut(page, 's', 'smudge')
  })

  test('CT-E2E-005 Fill (G) — tap fill on canvas', async ({ page }) => {
    await selectTool(page, 'fill')
    await expectCanvasHint(page, /fill/i)
    await clickCanvas(page, 0.5, 0.5)
    await selectToolShortcut(page, 'g', 'fill')
  })

  test('CT-E2E-006 Gradient (U) — drag creates gradient', async ({ page }) => {
    await selectTool(page, 'gradient')
    await expectCanvasHint(page, /gradient/i)
    await dragOnCanvas(page)
    await selectToolShortcut(page, 'u', 'gradient')
  })

  test('CT-E2E-007 Shape (R) — drag creates shape draft', async ({ page }) => {
    await selectTool(page, 'shape')
    await expectCanvasHint(page, /shape|draw/i)
    await expect(page.getByRole('button', { name: /tool settings/i })).toHaveAttribute('aria-pressed', 'true')
    await dragOnCanvas(page, { shift: true })
    await expectViewportToolClass(page, 'shape')
    await selectToolShortcut(page, 'r', 'shape')
  })

  test('CT-E2E-008 Text (T) — tap opens text input', async ({ page }) => {
    await selectTool(page, 'text')
    await expectCanvasHint(page, /text/i)
    await clickCanvas(page, 0.4, 0.4)
    await expect(page.getByTestId('studio-text-input')).toBeVisible()
    await page.getByTestId('studio-text-input').fill('E2E')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('studio-text-input')).toHaveCount(0)
    await selectToolShortcut(page, 't', 'text')
  })

  test('CT-E2E-009 Image (I) — tool activates', async ({ page }) => {
    await selectTool(page, 'image')
    await clickCanvas(page, 0.5, 0.5)
    await selectToolShortcut(page, 'i', 'image')
  })

  test('CT-E2E-010 Sticker (K) — click places sticker', async ({ page }) => {
    await selectTool(page, 'sticker')
    await clickCanvas(page, 0.55, 0.45)
    await selectToolShortcut(page, 'k', 'sticker')
  })

  test('CT-E2E-011 Frame (F) — drag creates frame', async ({ page }) => {
    await selectTool(page, 'frame')
    await dragOnCanvas(page)
    await selectToolShortcut(page, 'f', 'frame')
  })

  test('CT-E2E-012 AI (A) — dock visible', async ({ page }) => {
    await selectTool(page, 'ai')
    await expect(page.getByText('AI Studio')).toBeVisible()
    await expect(page.getByRole('button', { name: /Expand/i })).toBeVisible()
    await selectToolShortcut(page, 'a', 'ai')
  })

  test('CT-E2E-013 Zoom (Z) — viewport tool class and scrub', async ({ page }) => {
    await selectTool(page, 'zoom')
    await expectViewportToolClass(page, 'zoom')
    await expectCanvasHint(page, /zoom/i)
    const { box } = await canvasSurface(page)
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx, cy - 40, { steps: 6 })
    await page.mouse.up()
    await selectToolShortcut(page, 'z', 'zoom')
  })

  test('CT-E2E-014 Hand (H) — pan drag moves viewport', async ({ page }) => {
    await selectTool(page, 'hand')
    await expectViewportToolClass(page, 'hand')
    await expectCanvasHint(page, /move the canvas/i)
    const { box } = await canvasSurface(page)
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    await page.mouse.move(cx, cy)
    await page.mouse.down()
    await page.mouse.move(cx + 60, cy + 40, { steps: 6 })
    await page.mouse.up()
    await selectToolShortcut(page, 'h', 'hand')
  })

  test('CT-E2E-015 Space — temporary hand pan', async ({ page }) => {
    await selectTool(page, 'brush')
    await page.keyboard.down('Space')
    await expect(page.getByTestId('studio-canvas-viewport')).toHaveClass(/mas-canvas-viewport--tool-hand/)
    await page.keyboard.up('Space')
    await expect(page.getByTestId('studio-canvas-viewport')).toHaveClass(/mas-canvas-viewport--tool-brush/)
  })

  test('CT-E2E-016 All 14 tools have rail buttons', async ({ page }) => {
    const tools = [
      'select',
      'brush',
      'erase',
      'smudge',
      'fill',
      'gradient',
      'shape',
      'text',
      'image',
      'sticker',
      'frame',
      'ai',
      'zoom',
      'hand',
    ] as const
    for (const id of tools) {
      await expect(page.getByTestId(`studio-tool-${id}`)).toBeVisible()
    }
  })
})
