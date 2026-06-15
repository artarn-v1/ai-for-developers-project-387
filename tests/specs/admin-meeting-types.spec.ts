import { test, expect } from '@playwright/test'
import { createMeetingType, getMeetingTypes } from '../helpers/api.ts'

const ADMIN_SLUG = 'evgeny-admin'

test.describe('Admin: Meeting Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/admin/${ADMIN_SLUG}/meeting-types`)
  })

  test('displays existing meeting type from seed', async ({ page }) => {
    await expect(page.getByText('Личное напоминание про масло')).toBeVisible()
    await expect(page.getByText('personal-oil-change')).toBeVisible()
  })

  test('creates a new meeting type via form', async ({ page }) => {
    await page.getByRole('button', { name: 'Создать' }).click()

    const name = `Test Meeting ${Date.now()}`
    const slug = `test-meeting-${Date.now()}`

    await page.getByLabel('Name').fill(name)
    await page.getByLabel('Description').fill('E2E test description')
    await page.getByLabel('Slug').fill(slug)
    await page.getByLabel('Available From').fill('10:00')
    await page.getByLabel('Available To').fill('17:00')
    await page.getByLabel('Duration (minutes)').fill('45')
    await page.getByRole('button', { name: 'Create' }).click()

    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(slug)).toBeVisible()
  })

  test('toggles meeting type active status', async ({ page }) => {
    const types = await getMeetingTypes(ADMIN_SLUG)
    expect(types.length).toBeGreaterThan(0)

    const target = types[0]
    const switchInput = page.locator('table tbody tr').first().locator('input[type="checkbox"]')
    const currentState = await switchInput.isChecked()

    await switchInput.click({ force: true })

    await expect(switchInput).toBeChecked({ checked: !currentState })
  })
})
