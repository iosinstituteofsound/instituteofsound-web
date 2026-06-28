import { test, expect } from '@playwright/test'
import {
  STUDIO_E2E_ENABLED,
  addLayers,
  clickCanvas,
  dragOnCanvas,
  openStudio,
  paintStrokeAt,
  seekTimeline,
  selectLayer,
  selectTool,
  waitForTimelineClips,
} from './helpers/studio'

/**
 * Artwork + animation agent — paints a 4-layer scene and keyframes a moving brush stroke.
 *
 * Run (keeps browser open for play/export):
 *   SEQUENCE_E2E=1 STUDIO_AGENT_HOLD=1 npx playwright test e2e/studio-artwork-agent.spec.ts --headed
 */

test.describe.configure({ mode: 'serial', timeout: 300_000 })

test.describe('Studio Artwork Agent @artwork', () => {
  test('build layered artwork + animation', async ({ page }) => {
    test.skip(!STUDIO_E2E_ENABLED, 'Set SEQUENCE_E2E=1 to run artwork agent')

    await openStudio(page)
    await expect(page.getByText(/Infinite Sequence/i)).toBeVisible({ timeout: 15000 })

    // --- Layer 1: sky gradient ---
    await selectLayer(page, 'Layer 1')
    await selectTool(page, 'gradient')
    await dragOnCanvas(page, { from: { x: 0.5, y: 0.05 }, to: { x: 0.5, y: 0.55 } })
    await page.waitForTimeout(400)

    // --- Layer 2: green ground ---
    await addLayers(page, 1)
    await selectLayer(page, 'Layer 2')
    await selectTool(page, 'fill')
    await clickCanvas(page, 0.5, 0.82)
    await page.waitForTimeout(400)

    // --- Layer 3: sun (circle shape) ---
    await addLayers(page, 1)
    await selectLayer(page, 'Layer 3')
    await selectTool(page, 'shape')
    await page.getByRole('button', { name: /tool settings/i }).click()
    await page.waitForTimeout(200)
    await dragOnCanvas(page, { shift: true, from: { x: 0.72, y: 0.12 }, to: { x: 0.88, y: 0.28 } })
    await page.waitForTimeout(400)

    // --- Layer 4: animated character (brush bird) ---
    await addLayers(page, 1)
    await selectLayer(page, 'Layer 4')

    // Keyframe 1 — start
    await seekTimeline(page, 0.04)
    await selectTool(page, 'brush')
    await paintStrokeAt(page, { x: 0.18, y: 0.45 }, { x: 0.28, y: 0.42 })
    await paintStrokeAt(page, { x: 0.22, y: 0.38 }, { x: 0.26, y: 0.48 })
    await waitForTimelineClips(page, 1)

    // Keyframe 2 — middle
    await seekTimeline(page, 0.42)
    await selectTool(page, 'brush')
    await paintStrokeAt(page, { x: 0.42, y: 0.4 }, { x: 0.52, y: 0.38 })
    await paintStrokeAt(page, { x: 0.46, y: 0.33 }, { x: 0.5, y: 0.43 })

    // Keyframe 3 — end
    await seekTimeline(page, 0.78)
    await selectTool(page, 'brush')
    await paintStrokeAt(page, { x: 0.68, y: 0.36 }, { x: 0.78, y: 0.34 })
    await paintStrokeAt(page, { x: 0.72, y: 0.29 }, { x: 0.76, y: 0.39 })

    const clipCount = await page.getByTestId('sequence-timeline-clip').count()
    expect(clipCount).toBeGreaterThanOrEqual(3)

    // Back to start for user
    await seekTimeline(page, 0.02)
    await selectTool(page, 'select')

    console.log('\n✅ Artwork agent done — 4 layers, animation clips on timeline.')
    console.log('   → Press Play on timeline, then Export GIF from top bar.\n')

    if (process.env.STUDIO_AGENT_HOLD === '1') {
      await page.pause()
    } else {
      await page.waitForTimeout(120_000)
    }
  })
})
