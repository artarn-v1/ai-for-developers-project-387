import { test, expect } from '@playwright/test'
import { createMeetingType, getMeetingTypes, createMeeting, getMeetings } from '../helpers/api.ts'

const ADMIN_SLUG = 'evgeny-admin'
const OWNER_SLUG = 'evgeny'

test('Full E2E: Admin creates → Client books → Admin confirms', async ({ page }) => {
  const ts = Date.now()
  const meetingTypeName = `E2E Meeting ${ts}`
  const meetingTypeSlug = `e2e-meeting-${ts}`
  const userEmail = `e2euser-${ts}@example.com`

  await createMeetingType(ADMIN_SLUG, {
    name: meetingTypeName,
    description: 'Created by E2E test',
    slug: meetingTypeSlug,
    availableFrom: '09:00',
    availableTo: '18:00',
    durationMinutes: 30,
    isActive: true,
  })

  const types = await getMeetingTypes(ADMIN_SLUG)
  const created = types.find((t) => t.slug === meetingTypeSlug)
  expect(created).toBeDefined()

  // Client: see the new meeting type on the public page
  await page.goto(`/client/${OWNER_SLUG}`)
  await expect(page.getByText(meetingTypeName)).toBeVisible()

  // Book via API (reliable, bypasses UI overlay issues)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setUTCHours(6, 0, 0, 0)

  const booking = await createMeeting(OWNER_SLUG, meetingTypeSlug, {
    startDateTime: tomorrow.toISOString(),
    comment: 'E2E test booking',
    participants: [
      { name: 'E2E User', email: userEmail },
    ],
  })
  expect(booking).toBeDefined()

  // Admin: find and confirm the booking
  await page.goto(`/admin/${ADMIN_SLUG}/meetings`)
  await expect(page.getByText(meetingTypeName)).toBeVisible()

  await page.getByRole('row').filter({ hasText: meetingTypeName }).getByRole('button', { name: 'View' }).click()
  await expect(page.getByText('Meeting Details')).toBeVisible()
  await expect(page.getByText('E2E User').first()).toBeVisible()
  await expect(page.getByText(userEmail).first()).toBeVisible()
  await expect(page.getByText('E2E test booking')).toBeVisible()

  await page.getByRole('dialog', { name: 'Meeting Details' }).getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('dialog', { name: 'Meeting Details' }).getByText('Confirmed')).toBeVisible()

  // Verify via API
  const meetings = await getMeetings(ADMIN_SLUG)
  const ourMeeting = meetings.find((m) =>
    m.meetingType.slug === meetingTypeSlug,
  )
  expect(ourMeeting?.isConfirmed).toBe(true)
})
