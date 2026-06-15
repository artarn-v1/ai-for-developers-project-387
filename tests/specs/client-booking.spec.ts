import { test, expect } from '@playwright/test'

const CLIENT_SLUG = 'evgeny'
const testEmail = `testuser-${Date.now()}@example.com`

function getTomorrowDate(): number {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.getDate()
}

test.describe('Client: Booking flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/client/${CLIENT_SLUG}`)
  })

  test('displays active meeting types', async ({ page }) => {
    await expect(page.getByText('Evgeny')).toBeVisible()
    await expect(page.getByText('Личное напоминание про масло')).toBeVisible()
  })

  test('books a meeting end-to-end', async ({ page }) => {
    await page.getByText('Личное напоминание про масло').click()

    await expect(page.getByText('Личное напоминание про масло').first()).toBeVisible()
    await expect(page.getByText('30m').first()).toBeVisible()

    const selectableDays = page.locator('div[style*="cursor: pointer"]')
    await selectableDays.nth(1).click()

    await page.getByText('09:00').first().click()

    await page.getByLabel('Name *').fill('Test User')
    await page.getByLabel('Email *').fill(testEmail)

    await page.getByRole('button', { name: 'Confirm' }).click({ force: true })

    await expect(page.getByText('Встреча успешно запланирована')).toBeVisible()
  })
})
