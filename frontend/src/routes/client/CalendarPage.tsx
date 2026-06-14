import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  TextInput,
  Button,
  Stack,
  Loader,
  Alert,
  Text,
  Group,
  Title,
  Box,
  CloseButton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { getMeetingType, getOccupiedSlots, createMeeting } from '../../api/user.ts'
import type { components } from '../../types/api.ts'
import { COLORS } from '../../theme.ts'
import { wallClockInZone, todayInZone, datePartsInZone } from '../../lib/datetime.ts'

export interface SelectedDate {
  year: number
  month: number
  date: number
}

export interface SelectedSlot {
  time: string
  dateTime: string
}

interface TimeSlot {
  time: string
  dateTime: Date
  isOccupied: boolean
  isPast: boolean
}

type ClientMeetingResponse = components['schemas']['Client.ClientMeetingResponse']

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatTimeRange(time: string, durationMinutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const endM = m + durationMinutes
  const endH = h + Math.floor(endM / 60)
  const endMin = endM % 60
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' - ' + String(endH).padStart(2, '0') + ':' + String(endMin).padStart(2, '0')
}

export default function CalendarPage() {
  const { ownerSlug, meetingTypeSlug } = useParams<{ ownerSlug: string; meetingTypeSlug: string }>()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [mode, setMode] = useState<'calendar' | 'booking'>('calendar')

  const { data: meetingType, isLoading: typeLoading, error: typeError } = useQuery({
    queryKey: ['client-meeting-type', ownerSlug, meetingTypeSlug],
    queryFn: () => getMeetingType(ownerSlug!, meetingTypeSlug!),
    enabled: !!ownerSlug && !!meetingTypeSlug,
  })

  const { data: occupiedMeetings, isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ['client-occupied-slots', ownerSlug, meetingTypeSlug],
    queryFn: () => getOccupiedSlots(ownerSlug!, meetingTypeSlug!),
    enabled: !!ownerSlug && !!meetingTypeSlug,
  })

  const ownerTimeZone = meetingType?.owner.timeZone

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const timeSlots = useMemo((): TimeSlot[] => {
    if (!selectedDate || !meetingType || !ownerTimeZone) return []

    const [fromH, fromM] = meetingType.availableFrom.split(':').map(Number)
    const [toH, toM] = meetingType.availableTo.split(':').map(Number)
    const duration = meetingType.durationMinutes

    const startMinutes = fromH * 60 + fromM
    const endMinutes = toH * 60 + toM

    const { year, month, date } = selectedDate

    const occupiedIntervals = (occupiedMeetings ?? [])
      .filter((m) => {
        const parts = datePartsInZone(m.startDateTime, ownerTimeZone)
        return parts.date === date && parts.month === month && parts.year === year
      })
      .map((m) => ({
        start: new Date(m.startDateTime).getTime(),
        end: new Date(m.endDateTime).getTime(),
      }))

    const slots: TimeSlot[] = []

    for (let min = startMinutes; min + duration <= endMinutes; min += duration) {
      const h = Math.floor(min / 60)
      const m = min % 60
      const slotDateTime = wallClockInZone(year, month, date, h, m, ownerTimeZone)
      const slotTime = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')

      const slotStart = slotDateTime.getTime()
      const slotEnd = slotStart + duration * 60 * 1000

      const isOccupied = occupiedIntervals.some((o) => slotStart < o.end && slotEnd > o.start)
      const isPast = slotStart < now

      slots.push({ time: slotTime, dateTime: slotDateTime, isOccupied, isPast })
    }

    return slots
  }, [selectedDate, meetingType, ownerTimeZone, occupiedMeetings, now])

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const todayParts = ownerTimeZone
      ? todayInZone(ownerTimeZone)
      : (() => {
          const n = new Date()
          return { year: n.getFullYear(), month: n.getMonth(), date: n.getDate() }
        })()
    const today = new Date(todayParts.year, todayParts.month, todayParts.date)
    const maxDate = new Date(todayParts.year, todayParts.month, todayParts.date + 14)

    const days: { date: number; isCurrentMonth: boolean; isSelectable: boolean }[] = []

    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth)

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false, isSelectable: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const isSelectable = date >= today && date <= maxDate
      days.push({ date: d, isCurrentMonth: true, isSelectable })
    }

    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: d, isCurrentMonth: false, isSelectable: false })
    }

    return days
  }, [calendarMonth, ownerTimeZone])

  const handleDateSelect = useCallback((date: number) => {
    setSelectedDate({ year: calendarMonth.year, month: calendarMonth.month, date })
    setSelectedSlot(null)
  }, [calendarMonth])

  const handleSlotClick = useCallback((slot: TimeSlot) => {
    if (!slot.isOccupied && !slot.isPast) {
      setSelectedSlot(slot)
      setMode('booking')
    }
  }, [])

  const handleBack = useCallback(() => {
    setSelectedSlot(null)
    setMode('calendar')
  }, [])

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      comment: '',
      participants: [{ name: '', email: '' }],
    },
    validate: {
      participants: {
        name: (val: string) => (val.trim().length > 0 ? null : 'Name is required'),
        email: (val: string) => (/^\S+@\S+\.\S+$/.test(val) ? null : 'Invalid email'),
      },
    },
  })

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      createMeeting(ownerSlug!, meetingTypeSlug!, {
        startDateTime: selectedSlot!.dateTime.toISOString(),
        comment: values.comment.trim() || undefined,
        participants: values.participants.map((p) => ({
          name: p.name.trim(),
          email: p.email.trim(),
        })),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<ClientMeetingResponse[]>(
        ['client-occupied-slots', ownerSlug, meetingTypeSlug],
        (old) => [...(old ?? []), data],
      )
      queryClient.invalidateQueries({ queryKey: ['client-occupied-slots', ownerSlug, meetingTypeSlug] })
      setSelectedSlot(null)
      setMode('calendar')
    },
  })

  const handleConfirm = useCallback((values: typeof form.values) => {
    mutation.mutate(values)
  }, [mutation])

  const selectedDateFormatted = selectedDate
    ? DAYS[new Date(selectedDate.year, selectedDate.month, selectedDate.date).getDay()] + ', ' + MONTHS[selectedDate.month] + ' ' + selectedDate.date + ', ' + selectedDate.year
    : ''

  const headerTime = meetingType
    ? (selectedSlot
      ? formatTimeRange(selectedSlot.time, meetingType.durationMinutes)
      : meetingType.availableFrom + ' - ' + meetingType.availableTo)
    : ''

  const inputInputStyle: React.CSSProperties = {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
    color: COLORS.text,
    borderRadius: 8,
    height: 42,
  }

  const inputLabelStyle: React.CSSProperties = {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 500,
  }

  if (typeLoading || slotsLoading) return <Loader />
  if (typeError || slotsError) return <Alert color="red">Ошибка загрузки данных</Alert>
  if (!meetingType) return <Alert color="red">Тип встречи не найден</Alert>

  const participantFields = form.getValues().participants.map((_, index) => (
    <Group key={index} align="flex-start" gap={8} wrap="nowrap">
      <TextInput
        style={{ flex: 1 }}
        label={index === 0 ? 'Name *' : undefined}
        placeholder="John Doe"
        key={form.key(`participants.${index}.name`)}
        {...form.getInputProps(`participants.${index}.name`)}
        styles={{ input: { ...inputInputStyle }, label: { ...inputLabelStyle } }}
      />
      <TextInput
        style={{ flex: 1 }}
        label={index === 0 ? 'Email *' : undefined}
        placeholder="john@example.com"
        key={form.key(`participants.${index}.email`)}
        {...form.getInputProps(`participants.${index}.email`)}
        styles={{ input: { ...inputInputStyle }, label: { ...inputLabelStyle } }}
      />
      {form.getValues().participants.length > 1 && (
        <CloseButton
          mt={index === 0 ? 28 : 4}
          onClick={() => form.removeListItem('participants', index)}
          aria-label="Remove participant"
          style={{ color: COLORS.mutedText, flexShrink: 0 }}
        />
      )}
    </Group>
  ))

  return (
    <Box style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: 'system-ui, sans-serif',
      padding: 24,
    }}>
      <Box style={{
        width: 1040,
        height: 490,
        borderRadius: 16,
        background: COLORS.cardBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderStyle: 'solid',
        display: 'flex',
        overflow: 'hidden',
      }}>
        {/* Left panel - meeting info */}
        <Box style={{
          width: 240,
          flexShrink: 0,
          padding: '28px 24px',
          borderRightColor: COLORS.border,
          borderRightWidth: 1,
          borderRightStyle: 'solid',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <Box style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            background: COLORS.avatarBg,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 600,
          }}>
            {meetingType.owner.name.charAt(0).toUpperCase()}
          </Box>

          <Title order={4} style={{ color: COLORS.text, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {meetingType.name}
          </Title>

          <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0 }}>
            {meetingType.durationMinutes + 'm'}
          </Text>

          <Text style={{ color: COLORS.mutedText, fontSize: 12, margin: 0 }}>
            {ownerTimeZone}
          </Text>

          {selectedDate && (
            <Text style={{ color: COLORS.mutedText, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              {selectedDateFormatted}
              {selectedSlot && '\n' + formatTimeRange(selectedSlot.time, meetingType.durationMinutes)}
            </Text>
          )}
        </Box>

        {/* Right panel */}
        <Box style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Calendar view */}
          <Box style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            padding: '20px 24px',
            opacity: mode === 'calendar' ? 1 : 0,
            pointerEvents: mode === 'calendar' ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Group style={{ margin: 0, justifyContent: 'space-between' }}>
              <Text style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text }}>
                {MONTHS[calendarMonth.month] + ' ' + calendarMonth.year}
              </Text>
              <Group style={{ margin: 0, gap: 8 }}>
                <Button
                  variant="subtle"
                  size="xs"
                  color={COLORS.mutedText}
                  onClick={() => {
                    setCalendarMonth((prev) => {
                      const m = prev.month - 1
                      return { month: m === -1 ? 11 : m, year: m === -1 ? prev.year - 1 : prev.year }
                    })
                  }}
                  style={{ color: COLORS.mutedText, padding: '2px 8px' }}
                >
                  {'\u2039'}
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  color={COLORS.mutedText}
                  onClick={() => {
                    setCalendarMonth((prev) => {
                      const m = prev.month + 1
                      return { month: m === 12 ? 0 : m, year: m === 12 ? prev.year + 1 : prev.year }
                    })
                  }}
                  style={{ color: COLORS.mutedText, padding: '2px 8px' }}
                >
                  {'\u203a'}
                </Button>
              </Group>
            </Group>

            <Box style={{ display: 'flex', gap: 24, flex: 1, marginTop: 12, overflow: 'hidden' }}>
              {/* Calendar grid */}
              <Box style={{ flex: 5, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                  {DAYS_SHORT.map((d) => (
                    <Text key={d} style={{
                      textAlign: 'center',
                      fontSize: 11,
                      color: COLORS.mutedText,
                      fontWeight: 500,
                      margin: 0,
                    }}>
                      {d}
                    </Text>
                  ))}
                </Box>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                  {calendarDays.map((day, idx) => {
                    const isSelected = selectedDate?.date === day.date
                      && selectedDate.month === calendarMonth.month
                      && selectedDate.year === calendarMonth.year
                      && day.isCurrentMonth

                    const cellBg = isSelected
                      ? '#fff'
                      : day.isSelectable
                        ? COLORS.slotOccupied
                        : day.isCurrentMonth
                          ? COLORS.cardBg
                          : 'transparent'

                    const cellColor = isSelected ? COLORS.bg : day.isSelectable ? COLORS.text : COLORS.mutedText

                    return (
                      <Box
                        key={idx}
                        onClick={() => day.isSelectable && handleDateSelect(day.date)}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: isSelected ? 700 : 400,
                          cursor: day.isSelectable ? 'pointer' : 'default',
                          opacity: day.isCurrentMonth ? 1 : 0.25,
                          backgroundColor: cellBg,
                          color: cellColor,
                          transition: 'all 0.15s',
                        }}
                      >
                        {day.date}
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              {/* Time slots */}
              {selectedDate && (
                <Box style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, margin: '0 0 8px 0' }}>
                    {headerTime}
                  </Text>
                  <Box className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                    <Stack gap={4}>
                      {timeSlots.map((slot) => {
                        const isSelected = selectedSlot?.time === slot.time
                        const isDisabled = slot.isOccupied || slot.isPast

                        const slotBg = isSelected ? COLORS.selectedSlot : 'transparent'
                        const slotTextColor = isSelected ? '#fff' : COLORS.text

                        return (
                          <Box
                            key={slot.time}
                            onClick={() => handleSlotClick(slot)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 14px',
                              borderRadius: 8,
                              borderWidth: 1,
                              borderStyle: 'solid',
                              borderColor: isSelected ? COLORS.selectedSlot : COLORS.border,
                              cursor: isDisabled ? 'default' : 'pointer',
                              opacity: isDisabled ? 0.4 : 1,
                              backgroundColor: slotBg,
                              color: slotTextColor,
                              transition: 'all 0.15s',
                            }}
                          >
                            <Box style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: isDisabled ? COLORS.slotOccupied : COLORS.slotAvailable,
                              flexShrink: 0,
                            }} />
                            <Text style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                              {slot.time}
                            </Text>
                          </Box>
                        )
                      })}
                      {timeSlots.length === 0 && (
                        <Text style={{ color: COLORS.mutedText, fontSize: 13, margin: 0 }}>Нет доступных слотов</Text>
                      )}
                    </Stack>
                  </Box>
                </Box>
              )}
            </Box>

            {!selectedDate && (
              <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0, marginTop: 16 }}>
                Выберите дату для просмотра доступного времени
              </Text>
            )}
          </Box>

          {/* Booking form view */}
          <Box style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            padding: '24px 28px',
            opacity: mode === 'booking' ? 1 : 0,
            pointerEvents: mode === 'booking' ? 'auto' : 'none',
          }}>
            <Box component="form" onSubmit={form.onSubmit(handleConfirm)}>
              <Stack gap={14}>
                {participantFields}

                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => form.insertListItem('participants', { name: '', email: '' })}
                  style={{ alignSelf: 'flex-start' }}
                >
                  + Add participant
                </Button>

                <TextInput
                  label="Additional notes"
                  placeholder="Optional note"
                  key={form.key('comment')}
                  {...form.getInputProps('comment')}
                  styles={{ input: { ...inputInputStyle }, label: { ...inputLabelStyle } }}
                />

                <Group style={{ justifyContent: 'flex-end', gap: 12 }}>
                  <Button variant="subtle" color={COLORS.mutedText} onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" loading={mutation.isPending}>
                    Confirm
                  </Button>
                </Group>

                {mutation.isError && (
                  <Alert color="red">
                    {mutation.error instanceof Error ? mutation.error.message : 'Booking failed. Please try again.'}
                  </Alert>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
