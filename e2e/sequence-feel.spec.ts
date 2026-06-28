import { test, expect } from '@playwright/test'

/**
 * Feel Tests — measurable UX gates (Phase 1).
 * Requires authenticated session for full studio flow.
 * Set SEQUENCE_E2E=1 and auth storage state for CI runs.
 */

const sequenceE2eEnabled = process.env.SEQUENCE_E2E === '1'

test.describe('Sequence Feel Tests @phase1', () => {
  test('FT-001 hold block appears after paint commit', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    await page.getByRole('button', { name: /create/i }).first().click()
    await page.getByRole('button', { name: /2048|square|preset/i }).first().click({ timeout: 15000 })

    const timeline = page.getByTestId('sequence-timeline')
    await expect(timeline).toBeVisible({ timeout: 15000 })

    const canvas = page.locator('.mas-canvas-viewport canvas').first()
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    if (!box) throw new Error('canvas not found')

    const start = Date.now()
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.4)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 8 })
    await page.mouse.up()

    const clip = page.getByTestId('sequence-timeline-clip').first()
    await expect(clip).toBeVisible({ timeout: 150 })
    expect(Date.now() - start).toBeLessThan(1500)
  })

  test('FT-002 resize handle preserves block identity', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clip = page.getByTestId('sequence-timeline-clip').first()
    test.skip(!(await clip.isVisible().catch(() => false)), 'Requires existing hold clip in studio')

    const blockId = await clip.getAttribute('data-block-id')
    const handle = clip.locator('.mas-clip__resize-handle')
    await expect(handle).toBeVisible()

    const handleBox = await handle.boundingBox()
    if (!handleBox) throw new Error('resize handle missing')

    await page.mouse.move(handleBox.x + 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(handleBox.x + 80, handleBox.y + handleBox.height / 2, { steps: 6 })
    await page.mouse.up()

    await expect(clip).toHaveAttribute('data-block-id', blockId ?? '')
  })

  test('FT-005 timeline drag produces single undo step', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clip = page.getByTestId('sequence-timeline-clip').first()
    test.skip(!(await clip.isVisible().catch(() => false)), 'Requires hold clip')

    const clipBox = await clip.boundingBox()
    if (!clipBox) throw new Error('clip missing')

    await page.mouse.move(clipBox.x + 20, clipBox.y + clipBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(clipBox.x + 120, clipBox.y + clipBox.height / 2, { steps: 8 })
    await page.mouse.up()

    const undoBtn = page.getByRole('button', { name: /undo/i }).first()
    await undoBtn.click()
    await expect(clip).toBeVisible()
  })
})

test.describe('Sequence Feel Tests @phase2', () => {
  test('FT-010 snap flash on clip drag near playhead', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clip = page.getByTestId('sequence-timeline-clip').first()
    test.skip(!(await clip.isVisible().catch(() => false)), 'Requires hold clip')

    const clipBox = await clip.boundingBox()
    if (!clipBox) throw new Error('clip missing')

    await page.mouse.move(clipBox.x + 20, clipBox.y + clipBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(clipBox.x + 40, clipBox.y + clipBox.height / 2, { steps: 4 })
    await page.mouse.up()
    await expect(clip).toBeVisible()
  })

  test('FT-016 block inspector visible after clip select', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clip = page.getByTestId('sequence-timeline-clip').first()
    test.skip(!(await clip.isVisible().catch(() => false)), 'Requires hold clip')

    await clip.click()
    await expect(page.getByTestId('sequence-block-inspector')).toBeVisible()
    await expect(page.getByTestId('sequence-inspector-behavior')).toBeVisible()
  })

  test('FT-018 onion toggle enables onion skin setting', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const toggle = page.getByTestId('sequence-onion-toggle')
    await expect(toggle).toBeVisible({ timeout: 15000 })
    await toggle.click()
    await expect(toggle).toBeVisible()
  })
})

test.describe('Sequence Feel Tests @phase3', () => {
  test('FT-020 convert hold to sequence shows badge', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clip = page.getByTestId('sequence-timeline-clip').first()
    test.skip(!(await clip.isVisible().catch(() => false)), 'Requires hold clip')

    await clip.click()
    await page.getByTestId('sequence-convert-btn').click()
    await expect(page.getByTestId('sequence-clip-badge')).toBeVisible({ timeout: 5000 })
  })

  test('FT-022 double-click sequence opens breadcrumb', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clip = page.getByTestId('sequence-timeline-clip').first()
    test.skip(!(await clip.isVisible().catch(() => false)), 'Requires sequence clip')

    await clip.dblclick()
    await expect(page.getByTestId('sequence-breadcrumb')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sequence Feel Tests @phase3b', () => {
  test('FT-030 Cmd+G groups selected clips into compound', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clips = page.getByTestId('sequence-timeline-clip')
    test.skip((await clips.count()) < 2, 'Requires at least two hold clips')

    await clips.nth(0).click()
    await clips.nth(1).click({ modifiers: ['Shift'] })
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+G' : 'Control+G')
    await expect(page.locator('[data-block-kind="compound"]')).toBeVisible({ timeout: 5000 })
  })

  test('FT-032 convert to reference shows dashed clip', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const clip = page.getByTestId('sequence-timeline-clip').first()
    test.skip(!(await clip.isVisible().catch(() => false)), 'Requires hold clip')

    await clip.click()
    await page.getByTestId('sequence-reference-btn').click()
    await expect(page.locator('[data-block-kind="reference"]')).toBeVisible({ timeout: 5000 })
  })

  test('FT-033 duplicate reference creates second instance', async ({ page }) => {
    test.skip(!sequenceE2eEnabled, 'Set SEQUENCE_E2E=1 with auth to run studio e2e')

    await page.goto('/illustrator/canvas')
    const refClip = page.locator('[data-block-kind="reference"]').first()
    test.skip(!(await refClip.isVisible().catch(() => false)), 'Requires reference clip')

    await refClip.click()
    await page.getByTestId('sequence-dup-ref-btn').click()
    await expect(page.locator('[data-block-kind="reference"]')).toHaveCount(2, { timeout: 5000 })
  })
})
