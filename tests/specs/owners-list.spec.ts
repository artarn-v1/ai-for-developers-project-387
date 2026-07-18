import { test, expect } from '@playwright/test'

const OWNER_NAME = 'Evgeny'
const OWNER_SLUG = 'evgeny'
const TIMEZONE = 'Europe/Moscow'

test.describe('Home: Owners list', () => {
  test('TC-07: displays seed owner on home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(OWNER_NAME)).toBeVisible()
    await expect(page.getByText(TIMEZONE)).toBeVisible()
  })

  test('TC-08: navigates to client page on owner click', async ({ page }) => {
    await page.goto('/')
    await page.getByText(OWNER_NAME).click()
    await expect(page).toHaveURL(`/client/${OWNER_SLUG}`)
  })
})
