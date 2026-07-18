import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Extend once, globally. All time-zone aware logic for the booking flow
// goes through this re-exported dayjs instance.
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const WALLCLOCK_FORMAT = 'YYYY-MM-DD HH:mm'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Builds an absolute instant from a wall-clock date/time interpreted in the
 * owner's time zone. `month` is 0-based (matching JS Date).
 */
export function wallClockInZone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const str = `${year}-${pad(month + 1)}-${pad(day)} ${pad(hour)}:${pad(minute)}`
  return dayjs.tz(str, WALLCLOCK_FORMAT, timeZone).toDate()
}

/** Returns {year, month (0-based), date} of "now" in the given time zone. */
export function todayInZone(timeZone: string): { year: number; month: number; date: number } {
  const now = dayjs().tz(timeZone)
  return { year: now.year(), month: now.month(), date: now.date() }
}

/** Year/month(0-based)/date of an ISO instant, expressed in the given time zone. */
export function datePartsInZone(
  iso: string,
  timeZone: string,
): { year: number; month: number; date: number } {
  const d = dayjs(iso).tz(timeZone)
  return { year: d.year(), month: d.month(), date: d.date() }
}

/** Human-readable date+time of an ISO instant rendered in the owner's zone. */
export function formatInZone(iso: string, timeZone: string): string {
  return dayjs(iso).tz(timeZone).format('dddd, MMMM D, YYYY h:mm a')
}

export default dayjs
