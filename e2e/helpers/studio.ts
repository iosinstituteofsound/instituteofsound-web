import { expect, type Locator, type Page } from '@playwright/test'

export type StudioToolId =
  | 'select'
  | 'brush'
  | 'erase'
  | 'smudge'
  | 'fill'
  | 'gradient'
  | 'shape'
  | 'text'
  | 'image'
  | 'sticker'
  | 'frame'
  | 'ai'
  | 'zoom'
  | 'hand'

export const STUDIO_E2E_ENABLED = process.env.SEQUENCE_E2E === '1'
export const STUDIO_E2E_EMAIL =
  process.env.SEQUENCE_E2E_EMAIL?.trim() ||
  process.env.SUPER_ADMIN_EMAIL?.trim() ||
  'dev@dev.local'

type DevLoginPayload = {
  access_token: string
  refresh_token: string
}

type MeAuthorization = {
  resourceNames: string[]
  assignedRoles: Array<{ id: string; slug: string }>
}

async function fetchAuthorization(page: Page, accessToken: string): Promise<MeAuthorization> {
  const meRes = await page.request.get('/api/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!meRes.ok()) {
    throw new Error(`GET /api/v1/me failed (${meRes.status()}): ${await meRes.text()}`)
  }
  const body = (await meRes.json()) as { data: { authorization: MeAuthorization } }
  return body.data.authorization
}

async function setActiveRole(page: Page, accessToken: string, roleId: string) {
  const res = await page.request.patch('/api/v1/me/active-role', {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { roleId },
  })
  if (!res.ok()) {
    throw new Error(`PATCH /api/v1/me/active-role failed (${res.status()}): ${await res.text()}`)
  }
}

/** Ensure token bearer can open illustrator studio (super_admin or illustrator persona). */
async function ensureIllustratorAccess(page: Page, accessToken: string) {
  let auth = await fetchAuthorization(page, accessToken)
  if (auth.resourceNames.includes('IllustratorDashboardPage')) return accessToken

  const illustratorRole = auth.assignedRoles.find((role) => role.slug === 'illustrator')
  if (illustratorRole) {
    await setActiveRole(page, accessToken, illustratorRole.id)
    return accessToken
  }

  const superRole = auth.assignedRoles.find((role) => role.slug === 'super_admin')
  if (superRole) {
    await setActiveRole(page, accessToken, superRole.id)
    return accessToken
  }

  throw new Error(
    `E2E user "${STUDIO_E2E_EMAIL}" cannot access /illustrator/canvas (403). ` +
      'Set SEQUENCE_E2E_EMAIL to SUPER_ADMIN_EMAIL from instituteofsound-api/.env, ' +
      'or assign the illustrator role to this account.',
  )
}

async function sessionTokensInPage(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      Boolean(
        localStorage.getItem('ios_access_token') ||
          localStorage.getItem('ios_refresh_token') ||
          sessionStorage.getItem('ios_access_token') ||
          sessionStorage.getItem('ios_refresh_token'),
      ),
  )
}

async function injectSessionTokens(page: Page, tokens: DevLoginPayload) {
  await page.evaluate(
    ({ access, refresh }) => {
      localStorage.setItem('ios_access_token', access)
      localStorage.setItem('ios_refresh_token', refresh)
      sessionStorage.setItem('ios_access_token', access)
      sessionStorage.setItem('ios_refresh_token', refresh)
    },
    { access: tokens.access_token, refresh: tokens.refresh_token },
  )
}

/** Dev-login via API + localStorage (local stack required). */
export async function ensureAuthenticated(page: Page) {
  await page.goto('/illustrator/canvas')
  const createBtn = page.getByRole('button', { name: /^create$/i })
  if (await createBtn.isVisible({ timeout: 8000 }).catch(() => false)) return

  if (!(await sessionTokensInPage(page))) {
    const res = await page.request.post('/api/auth/dev/login', { data: { email: STUDIO_E2E_EMAIL } })
    if (!res.ok()) {
      throw new Error(`Dev login failed (${res.status()}): ${await res.text()}`)
    }
    const body = (await res.json()) as { data: DevLoginPayload }
    await ensureIllustratorAccess(page, body.data.access_token)
    await page.goto('/')
    await injectSessionTokens(page, body.data)
    await page.reload()
    await page.waitForResponse((r) => r.url().includes('/api/v1/me') && r.ok(), { timeout: 30000 }).catch(() => {})
  }

  await page.goto('/illustrator/canvas')
  await expect(createBtn).toBeVisible({ timeout: 20000 })
}

export async function openStudio(page: Page) {
  await ensureAuthenticated(page)
  await page.getByRole('button', { name: /^create$/i }).click()
  await page.getByRole('button', { name: /square|2048/i }).first().click({ timeout: 15000 })
  await expect(page.getByTestId('studio-canvas-viewport')).toBeVisible({ timeout: 20000 })
  await expect(page.locator('.mas-canvas-viewport canvas').first()).toBeVisible()
}

export async function selectTool(page: Page, toolId: StudioToolId) {
  const btn = page.getByTestId(`studio-tool-${toolId}`)
  await btn.click()
  await expect(btn).toHaveAttribute('aria-pressed', 'true')
}

export async function selectToolShortcut(page: Page, key: string, toolId: StudioToolId) {
  await page.keyboard.press(key)
  await expect(page.getByTestId(`studio-tool-${toolId}`)).toHaveAttribute('aria-pressed', 'true')
}

export async function canvasSurface(page: Page): Promise<{ canvas: Locator; box: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>> }> {
  const canvas = page.locator('.mas-canvas-viewport canvas').first()
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Canvas bounding box not found')
  return { canvas, box }
}

export async function clickCanvas(page: Page, xRatio = 0.5, yRatio = 0.5) {
  const { canvas } = await canvasSurface(page)
  await canvas.evaluate(
    (el, ratios) => {
      const rect = el.getBoundingClientRect()
      const clientX = rect.left + rect.width * ratios.x
      const clientY = rect.top + rect.height * ratios.y
      const opts: PointerEventInit = {
        clientX,
        clientY,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        bubbles: true,
        button: 0,
        buttons: 1,
      }
      el.dispatchEvent(new PointerEvent('pointerdown', opts))
      el.dispatchEvent(new PointerEvent('pointerup', { ...opts, buttons: 0 }))
    },
    { x: xRatio, y: yRatio },
  )
}

/** Short brush stroke at canvas center — creates hold clip when sequence engine is on. */
export async function paintStroke(page: Page) {
  const { box } = await canvasSurface(page)
  const cx = box.x + box.width * 0.45
  const cy = box.y + box.height * 0.45
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + box.width * 0.12, cy + box.height * 0.08, { steps: 10 })
  await page.mouse.up()
}

/** Drag on canvas (shape, gradient, frame). */
export async function dragOnCanvas(page: Page, opts?: { shift?: boolean; from?: { x: number; y: number }; to?: { x: number; y: number } }) {
  const { box } = await canvasSurface(page)
  const x1 = box.x + box.width * (opts?.from?.x ?? 0.35)
  const y1 = box.y + box.height * (opts?.from?.y ?? 0.35)
  const x2 = box.x + box.width * (opts?.to?.x ?? 0.65)
  const y2 = box.y + box.height * (opts?.to?.y ?? 0.55)
  await page.mouse.move(x1, y1)
  await page.mouse.down({ modifiers: opts?.shift ? ['Shift'] : [] })
  await page.mouse.move(x2, y2, { steps: 8 })
  await page.mouse.up()
}

export async function paintStrokeAt(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const { box } = await canvasSurface(page)
  const x1 = box.x + box.width * from.x
  const y1 = box.y + box.height * from.y
  const x2 = box.x + box.width * to.x
  const y2 = box.y + box.height * to.y
  await page.mouse.move(x1, y1)
  await page.mouse.down()
  await page.mouse.move(x2, y2, { steps: 12 })
  await page.mouse.up()
}

export async function addLayers(page: Page, count: number) {
  const btn = page.getByRole('button', { name: /^add layer$/i })
  for (let i = 0; i < count; i += 1) {
    await btn.click()
    await page.waitForTimeout(200)
  }
}

export async function selectLayer(page: Page, label: string | RegExp) {
  await page.getByRole('button', { name: typeof label === 'string' ? new RegExp(`^Select ${label}$`, 'i') : label }).click()
  await page.waitForTimeout(150)
}

/** Scrub playhead by clicking timeline track area (0..1). */
export async function seekTimeline(page: Page, ratio: number) {
  const tracks = page.locator('.mas-timeline__tracks').first()
  await expect(tracks).toBeVisible()
  const box = await tracks.boundingBox()
  if (!box) throw new Error('Timeline tracks not found')
  const y = box.y + box.height * 0.5
  const x = box.x + box.width * Math.max(0.02, Math.min(0.98, ratio))
  await page.mouse.click(x, y)
  await page.waitForTimeout(250)
}

export async function waitForTimelineClips(page: Page, min = 1) {
  const clips = page.getByTestId('sequence-timeline-clip')
  await expect.poll(async () => clips.count(), { timeout: 8000 }).toBeGreaterThanOrEqual(min)
}

export async function expectCanvasHint(page: Page, pattern: RegExp) {
  await expect(page.getByTestId('studio-canvas-hint')).toHaveText(pattern)
}

export async function expectViewportToolClass(page: Page, toolId: StudioToolId) {
  await expect(page.getByTestId('studio-canvas-viewport')).toHaveClass(new RegExp(`mas-canvas-viewport--tool-${toolId}`))
}
