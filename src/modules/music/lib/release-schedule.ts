function getTimeZoneParts(utcMs: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(utcMs))

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour') % 24,
    minute: read('minute'),
    second: read('second'),
  }
}

function zonedLocalToUtc(date: string, time: string, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute, second = 0] = time.split(':').map(Number)
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, second)

  let utcGuess = desiredUtc
  for (let i = 0; i < 3; i += 1) {
    const tzParts = getTimeZoneParts(utcGuess, timeZone)
    const tzAsUtc = Date.UTC(
      tzParts.year,
      tzParts.month - 1,
      tzParts.day,
      tzParts.hour,
      tzParts.minute,
      tzParts.second,
    )
    const delta = desiredUtc - tzAsUtc
    utcGuess += delta
    if (delta === 0) break
  }

  return new Date(utcGuess)
}

export function getDefaultReleaseTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export const COMMON_RELEASE_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export function buildReleaseDateIso(
  date: string,
  timeEnabled: boolean,
  hour: string,
  minute: string,
  period: 'AM' | 'PM',
  timeZone: string,
): string {
  if (!date) return new Date().toISOString()

  let h = parseInt(hour, 10)
  if (period === 'PM' && h < 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  const time = timeEnabled ? `${String(h).padStart(2, '0')}:${minute}:00` : '12:00:00'

  return zonedLocalToUtc(date, time, timeZone || getDefaultReleaseTimezone()).toISOString()
}

export function formatReleaseGoLivePreview(
  date: string,
  timeEnabled: boolean,
  hour: string,
  minute: string,
  period: 'AM' | 'PM',
  timeZone: string,
): string {
  if (!date) return ''
  const iso = buildReleaseDateIso(date, timeEnabled, hour, minute, period, timeZone)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: timeEnabled ? 'short' : undefined,
    timeZone,
  }).format(new Date(iso))
}
