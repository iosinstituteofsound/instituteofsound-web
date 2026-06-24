# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: canvas-resize.spec.ts >> Canvas text resize >> resize handle drag updates block width
- Location: e2e/canvas-resize.spec.ts:4:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[data-block-id="blk-test-1"]') to be visible

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('Canvas text resize', () => {
  4   |   test('resize handle drag updates block width', async ({ page }) => {
  5   |     await page.addInitScript(() => {
  6   |       window.localStorage.setItem(
  7   |         'ios-auth',
  8   |         JSON.stringify({
  9   |           state: {
  10  |             accessToken: 'e2e-test-token',
  11  |             refreshToken: 'e2e-refresh',
  12  |           },
  13  |         }),
  14  |       )
  15  |     })
  16  | 
  17  |     await page.route('**/api/**', async (route) => {
  18  |       const url = route.request().url()
  19  |       if (url.includes('/me') || url.includes('/auth/me')) {
  20  |         await route.fulfill({
  21  |           status: 200,
  22  |           contentType: 'application/json',
  23  |           body: JSON.stringify({
  24  |             id: 'user-1',
  25  |             email: 'test@test.com',
  26  |             displayName: 'Test User',
  27  |             authorization: { roles: ['editor'], assignedRoles: ['editor'] },
  28  |           }),
  29  |         })
  30  |         return
  31  |       }
  32  |       if (url.includes('/editor/articles') && route.request().method() === 'GET') {
  33  |         await route.fulfill({
  34  |           status: 200,
  35  |           contentType: 'application/json',
  36  |           body: JSON.stringify({
  37  |             id: 'article-1',
  38  |             slug: 'test',
  39  |             status: 'draft',
  40  |             excerpt: '',
  41  |             puckData: {
  42  |               puck: {
  43  |                 content: [
  44  |                   {
  45  |                     type: 'ArticleTitle',
  46  |                     props: {
  47  |                       blockId: 'blk-test-1',
  48  |                       text: 'Text',
  49  |                       layout: { x: 30, y: 20, width: 40, sizing: 'hug' },
  50  |                       style: {
  51  |                         fontSize: 33,
  52  |                         fontWeight: 'normal',
  53  |                         fontStyle: 'normal',
  54  |                         textAlign: 'left',
  55  |                         colorToken: 'foreground',
  56  |                         fontFamilyId: 'editorial-serif',
  57  |                         opacity: 100,
  58  |                         blendMode: 'normal',
  59  |                         angle: 0,
  60  |                         preserveAspectRatio: true,
  61  |                         effects: {},
  62  |                       },
  63  |                     },
  64  |                   },
  65  |                 ],
  66  |                 root: { props: {} },
  67  |               },
  68  |               meta: { workspaceMode: 'canvas' },
  69  |             },
  70  |           }),
  71  |         })
  72  |         return
  73  |       }
  74  |       if (url.includes('/editor/articles') && route.request().method() === 'PATCH') {
  75  |         await route.fulfill({
  76  |           status: 200,
  77  |           contentType: 'application/json',
  78  |           body: route.request().postData() ?? '{}',
  79  |         })
  80  |         return
  81  |       }
  82  |       await route.continue()
  83  |     })
  84  | 
  85  |     await page.goto('/editor/write/article-1')
> 86  |     await page.waitForSelector('[data-block-id="blk-test-1"]', { timeout: 15000 })
      |                ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  87  | 
  88  |     const block = page.locator('[data-block-id="blk-test-1"]')
  89  |     await block.click()
  90  | 
  91  |     const handle = page.getByRole('button', { name: 'Resize se' })
  92  |     await expect(handle).toBeVisible()
  93  | 
  94  |     const boxBefore = await block.boundingBox()
  95  |     expect(boxBefore).not.toBeNull()
  96  | 
  97  |     const handleBox = await handle.boundingBox()
  98  |     expect(handleBox).not.toBeNull()
  99  | 
  100 |     await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
  101 |     await page.mouse.down()
  102 |     await page.mouse.move(handleBox!.x + 80, handleBox!.y + 80, { steps: 10 })
  103 |     await page.mouse.up()
  104 | 
  105 |     await page.waitForTimeout(300)
  106 | 
  107 |     const boxAfter = await block.boundingBox()
  108 |     expect(boxAfter).not.toBeNull()
  109 |     expect(boxAfter!.width).toBeGreaterThan(boxBefore!.width + 5)
  110 |   })
  111 | })
  112 | 
```