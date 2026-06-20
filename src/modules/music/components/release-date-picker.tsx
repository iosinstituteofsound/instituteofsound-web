import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface ReleaseDatePickerProps {
  value: string
  onChange: (value: string) => void
  minDate?: string
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isBeforeDay(a: Date, b: Date): boolean {
  const aMidnight = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const bMidnight = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  return aMidnight.getTime() < bMidnight.getTime()
}

export function ReleaseDatePicker({ value, onChange, minDate }: ReleaseDatePickerProps) {
  const selectedDate = useMemo(() => (value ? parseIsoDate(value) : new Date()), [value])
  const minSelectable = useMemo(() => (minDate ? parseIsoDate(minDate) : new Date()), [minDate])
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate))

  const monthLabel = viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(viewMonth)
    const startOffset = firstDay.getDay()
    const gridStart = new Date(firstDay)
    gridStart.setDate(firstDay.getDate() - startOffset)

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + index)
      return date
    })
  }, [viewMonth])

  const selectedLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const quickPicks = useMemo(() => {
    const today = minSelectable
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    const twoWeeks = new Date(today)
    twoWeeks.setDate(today.getDate() + 14)
    return [
      { label: 'Today', date: today },
      { label: 'In 1 week', date: nextWeek },
      { label: 'In 2 weeks', date: twoWeeks },
    ]
  }, [minSelectable])

  const handleSelect = (date: Date) => {
    if (isBeforeDay(date, minSelectable)) return
    onChange(toIsoDate(date))
    setViewMonth(startOfMonth(date))
  }

  const canGoPrev =
    viewMonth.getFullYear() > minSelectable.getFullYear() ||
    (viewMonth.getFullYear() === minSelectable.getFullYear() && viewMonth.getMonth() > minSelectable.getMonth())

  return (
    <div className="rbl-date-picker">
      <div className="rbl-date-picker__summary">
        <p className="rbl-date-picker__label">Selected launch date</p>
        <p className="rbl-date-picker__value">{selectedLabel}</p>
      </div>

      <div className="rbl-date-picker__quick">
        {quickPicks.map((pick) => (
          <button
            key={pick.label}
            type="button"
            className={cn('rbl-date-picker__quick-btn', value === toIsoDate(pick.date) && 'rbl-date-picker__quick-btn--active')}
            onClick={() => handleSelect(pick.date)}
          >
            {pick.label}
          </button>
        ))}
      </div>

      <div className="rbl-date-picker__calendar">
        <div className="rbl-date-picker__nav">
          <button
            type="button"
            className="rbl-date-picker__nav-btn"
            onClick={() => setViewMonth((prev) => addMonths(prev, -1))}
            disabled={!canGoPrev}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="rbl-date-picker__month">{monthLabel}</p>
          <button
            type="button"
            className="rbl-date-picker__nav-btn"
            onClick={() => setViewMonth((prev) => addMonths(prev, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="rbl-date-picker__weekdays" aria-hidden>
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="rbl-date-picker__grid">
          {calendarDays.map((date) => {
            const iso = toIsoDate(date)
            const inCurrentMonth = date.getMonth() === viewMonth.getMonth()
            const disabled = isBeforeDay(date, minSelectable)
            const selected = value === iso
            const today = isSameDay(date, new Date())

            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                className={cn(
                  'rbl-date-picker__day',
                  !inCurrentMonth && 'rbl-date-picker__day--muted',
                  disabled && 'rbl-date-picker__day--disabled',
                  selected && 'rbl-date-picker__day--selected',
                  today && !selected && 'rbl-date-picker__day--today',
                )}
                onClick={() => handleSelect(date)}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
