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
  Overlay,
  Transition,
  CloseButton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState, useMemo, useCallback } from 'react'
import { getActiveMeetingTypes, getOccupiedSlots, createMeeting } from '../../api/user.ts'

interface TimeSlot {
  time: string
  dateTime: Date
  isOccupied: boolean
  isPast: boolean
}

const COLORS = {
  bg: '#18181b',
  cardBg: '#27272a',
  border: '#3f3f46',
  text: '#f4f4f5',
  mutedText: '#a1a1aa',
  slotAvailable: '#22c55e',
  slotOccupied: '#52525b',
  selectedSlot: '#22c55e',
  inputBg: '#27272a',
  inputBorder: '#3f3f46',
}

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

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const day = DAYS[d.getDay()]
  const month = MONTHS[d.getMonth()]
  let hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours >= 12 ? 'pm' : 'am'
  const displayH = hours % 12 || 12
  const displayM = String(minutes).padStart(2, '0')
  return day + ', ' + month + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' + displayH + ':' + displayM + ' ' + ampm
}

export default function BookingPage() {
  const { ownerSlug, meetingTypeSlug } = useParams<{ ownerSlug: string; meetingTypeSlug: string }>()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<{ startDateTime: string; endDateTime: string } | null>(null)

  const { data: types, isLoading: typesLoading, error: typesError } = useQuery({
    queryKey: ['client-meeting-types', ownerSlug],
    queryFn: () => getActiveMeetingTypes(ownerSlug!),
    enabled: !!ownerSlug,
  })

  const { data: occupiedMeetings, isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ['client-occupied-slots', ownerSlug, meetingTypeSlug],
    queryFn: () => getOccupiedSlots(ownerSlug!, meetingTypeSlug!),
    enabled: !!ownerSlug && !!meetingTypeSlug,
  })

  const meetingType = types?.find((t) => t.slug === meetingTypeSlug)

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      participantName: '',
      participantEmail: '',
      comment: '',
    },
    validate: {
      participantName: (val) => (val.length > 0 ? null : 'Name is required'),
      participantEmail: (val) => (/^\S+@\S+\.\S+$/.test(val) ? null : 'Invalid email'),
    },
  })

  const mutation = useMutation({
    mutationFn: (values: typeof form.values) =>
      createMeeting(ownerSlug!, meetingTypeSlug!, {
        startDateTime: selectedSlot!.dateTime.toISOString(),
        comment: values.comment,
        participants: [
          { name: values.participantName, email: values.participantEmail },
        ],
      }),
    onSuccess: (data) => {
      setBookingConfirmed(true)
      setConfirmedBooking({
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
      })
      queryClient.invalidateQueries({ queryKey: ['client-occupied-slots', ownerSlug, meetingTypeSlug] })
    },
  })

  // Generate time slots for selected date
  const timeSlots = useMemo((): TimeSlot[] => {
    if (!selectedDate || !meetingType) return []

    const [fromH, fromM] = meetingType.availableFrom.split(':').map(Number)
    const [toH, toM] = meetingType.availableTo.split(':').map(Number)
    const duration = meetingType.durationMinutes

    const startMinutes = fromH * 60 + fromM
    const endMinutes = toH * 60 + toM

    const selectedYear = selectedDate.getFullYear()
    const selectedMonth = selectedDate.getMonth()

    // Get occupied meetings for the selected date
    const occupied = (occupiedMeetings ?? [])
      .filter((m) => {
        const mDate = new Date(m.startDateTime)
        return mDate.getDate() === selectedDate.getDate()
          && mDate.getMonth() === selectedMonth
          && mDate.getFullYear() === selectedYear
      })

    const occupiedIntervals = occupied.map((m) => ({
      start: new Date(m.startDateTime).getTime(),
      end: new Date(m.endDateTime).getTime(),
    }))

    const slots: TimeSlot[] = []
    const now = Date.now()

    for (let min = startMinutes; min + duration <= endMinutes; min += duration) {
      const h = Math.floor(min / 60)
      const m = min % 60
      const slotDateTime = new Date(selectedYear, selectedMonth, selectedDate.getDate(), h, m)
      const slotTime = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')

      const slotStart = slotDateTime.getTime()
      const slotEnd = slotStart + duration * 60 * 1000

      const isOccupied = occupiedIntervals.some((o) => slotStart < o.end && slotEnd > o.start)
      const isPast = slotDateTime.getTime() < now

      slots.push({
        time: slotTime,
        dateTime: slotDateTime,
        isOccupied,
        isPast,
      })
    }

    return slots
  }, [selectedDate, meetingType, occupiedMeetings])

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 14)
    maxDate.setHours(0, 0, 0, 0)

    const days: { date: number; isCurrentMonth: boolean; isSelectable: boolean }[] = []

    // Previous month padding
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth)

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        isSelectable: false,
      })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const isSelectable = date >= today && date <= maxDate
      days.push({
        date: d,
        isCurrentMonth: true,
        isSelectable,
      })
    }

    // Next month padding
    const remaining = 42 - days.length

    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: d,
        isCurrentMonth: false,
        isSelectable: false,
      })
    }

    return days
  }, [calendarMonth])

  const handleDateSelect = useCallback((date: number) => {
    const newDate = new Date(calendarMonth.year, calendarMonth.month, date)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    if (newDate >= todayStart) {
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 14)
      maxDate.setHours(0, 0, 0, 0)
      if (newDate <= maxDate) {
        setSelectedDate(newDate)
        setSelectedSlot(null)
      }
    }
  }, [calendarMonth])

  const handleSlotClick = useCallback((slot: TimeSlot) => {
    if (!slot.isOccupied && !slot.isPast) {
      setSelectedSlot(slot)
      setShowOverlay(true)
      setBookingConfirmed(false)
      form.setValues({
        participantName: '',
        participantEmail: '',
        comment: '',
      })
    }
  }, [])

  const handleConfirm = useCallback((values: typeof form.values) => {
    mutation.mutate(values)
  }, [mutation])

  const handleBack = useCallback(() => {
    setShowOverlay(false)
    setBookingConfirmed(false)
    setSelectedSlot(null)
  }, [])

  // Pre-computed text values (no template literals in JSX)
  const selectedDateFormatted = selectedDate
    ? DAYS[selectedDate.getDay()] + ', ' + MONTHS[selectedDate.getMonth()] + ' ' + selectedDate.getDate() + ', ' + selectedDate.getFullYear()
    : ''

  const headerTime = meetingType
    ? (selectedSlot
      ? formatTimeRange(selectedSlot.time, meetingType.durationMinutes)
      : meetingType.availableFrom + ' - ' + meetingType.availableTo)
    : ''

  // Overlay style computed
  const overlayContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 800,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 16,
    background: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 32,
    display: 'flex',
    gap: 32,
    position: 'relative',
  }

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

  if (typesLoading || slotsLoading) return <Loader />
  if (typesError || slotsError) return <Alert color="red">Ошибка загрузки данных</Alert>
  if (!meetingType) return <Alert color="red">Тип встречи не найден</Alert>

  return (
    <Box style={{
      display: 'flex',
      height: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: 'system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Left panel - meeting info */}
      <Box style={{
        width: 240,
        padding: '32px 20px',
        borderRightColor: COLORS.border,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        flexShrink: 0,
      }}>
        {/* Avatar */}
        <Box style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: '#3f6212',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 600,
        }}>
          {meetingType.owner.name.charAt(0).toUpperCase()}
        </Box>

        {/* Meeting name */}
        <Title order={4} style={{ color: COLORS.text, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
          {meetingType.name}
        </Title>

        {/* Duration */}
        <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0 }}>
          {meetingType.durationMinutes + 'm'}
        </Text>

        {/* Selected date/time info */}
        {selectedDate && (
          <Text style={{ color: COLORS.mutedText, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            {selectedDateFormatted}
            {selectedSlot && '\n' + formatTimeRange(selectedSlot.time, meetingType.durationMinutes)}
          </Text>
        )}
      </Box>

      {/* Center panel - calendar + slots */}
      <Box style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 32px',
        gap: 24,
        overflowY: 'auto',
      }}>
        {/* Month header */}
        <Group style={{ margin: 0, justifyContent: 'space-between' }}>
          <Text style={{ margin: 0, fontSize: 18, fontWeight: 600, color: COLORS.text }}>
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

        {/* Calendar grid */}
        <Box>
          {/* Day headers */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS_SHORT.map((d) => (
              <Text key={d} style={{
                textAlign: 'center',
                fontSize: 12,
                color: COLORS.mutedText,
                fontWeight: 500,
                margin: 0,
              }}>
                {d}
              </Text>
            ))}
          </Box>
          {/* Date cells */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDate?.getDate() === day.date
                && selectedDate.getMonth() === calendarMonth.month
                && selectedDate.getFullYear() === calendarMonth.year

              const cellBg = isSelected
                ? '#fff'
                : day.isSelectable
                  ? '#52525b'
                  : day.isCurrentMonth
                    ? '#27272a'
                    : 'transparent'

              const cellColor = isSelected ? '#18181b' : day.isSelectable ? COLORS.text : COLORS.mutedText

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
                    borderRadius: 8,
                    fontSize: 14,
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
          <Box>
            <Text style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.text,
              margin: '0 0 12px 0',
            }}>
              {headerTime}
            </Text>
            <Stack gap={4}>
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot?.time === slot.time
                const isDisabled = slot.isOccupied || slot.isPast

                const slotBorderColor = isSelected ? '#22c55e' : COLORS.border
                const slotBg = isSelected ? '#22c55e' : 'transparent'
                const slotTextColor = isSelected ? '#fff' : COLORS.text

                return (
                  <Box
                    key={slot.time}
                    onClick={() => handleSlotClick(slot)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: isDisabled ? slotBorderColor : slotBorderColor,
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
                    <Text style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                      {slot.time}
                    </Text>
                  </Box>
                )
              })}
              {timeSlots.length === 0 && (
                <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0 }}>Нет доступных слотов</Text>
              )}
            </Stack>
          </Box>
        )}

        {!selectedDate && (
          <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0 }}>
            Выберите дату для просмотра доступного времени
          </Text>
        )}
      </Box>

      {/* Overlay: Booking form + Confirmation */}
      <Transition
        mounted={showOverlay}
        transition="fade"
        duration={200}
        timingFunction="linear"
      >
        {(overlayStyles) => (
          <Overlay
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              ...overlayStyles,
            }}
          >
            <Box style={overlayContainerStyle}>
              {/* Close button */}
              <CloseButton
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: COLORS.mutedText,
                }}
                onClick={handleBack}
              />

              {/* Left: meeting info */}
              <Box style={{
                width: 200,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                {/* Avatar + Name */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Box style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: '#3f6212',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {meetingType.owner.name.charAt(0).toUpperCase()}
                  </Box>
                  <Text style={{ margin: 0, fontSize: 14, fontWeight: 500, color: COLORS.text }}>
                    {meetingType.owner.name}
                  </Text>
                </Box>

                {/* Title */}
                <Title order={4} style={{ color: COLORS.text, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                  {meetingType.name}
                </Title>

                {/* Date & time */}
                {selectedSlot && (
                  <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                    {selectedDateFormatted + '\n' + formatTimeRange(selectedSlot.time, meetingType.durationMinutes)}
                  </Text>
                )}

                {/* Duration */}
                <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0 }}>
                  {meetingType.durationMinutes + 'm'}
                </Text>
              </Box>

              {/* Right: form or confirmation */}
              <Box style={{ flex: 1 }}>
                {bookingConfirmed && confirmedBooking ? (
                  /* Confirmation screen */
                  <Stack gap={16}>
                    <Title order={3} style={{ color: '#22c55e', fontWeight: 700, margin: 0 }}>
                      Booking Confirmed
                    </Title>

                    <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 600, margin: 0 }}>
                      {meetingType.name}
                    </Text>

                    <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                      {formatDateTime(confirmedBooking.startDateTime) + '\n' + formatDateTime(confirmedBooking.endDateTime)}
                    </Text>

                    <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0 }}>
                      Duration: {meetingType.durationMinutes + 'm'}
                    </Text>

                    <Button
                      onClick={() => {
                        setShowOverlay(false)
                        setBookingConfirmed(false)
                        setSelectedSlot(null)
                        setSelectedDate(null)
                        queryClient.invalidateQueries({ queryKey: ['client-occupied-slots', ownerSlug, meetingTypeSlug] })
                      }}
                      style={{ marginTop: 16 }}
                    >
                      Done
                    </Button>
                  </Stack>
                ) : (
                  /* Booking form */
                  <Box component="form" onSubmit={form.onSubmit(handleConfirm)}>
                    <Stack gap={16}>
                      <TextInput
                        label="Your name *"
                        placeholder="John Doe"
                        required
                        {...form.getInputProps('participantName')}
                        styles={{
                          input: { ...inputInputStyle },
                          label: { ...inputLabelStyle },
                        }}
                      />
                      <TextInput
                        label="Email address *"
                        placeholder="john@example.com"
                        required
                        {...form.getInputProps('participantEmail')}
                        styles={{
                          input: { ...inputInputStyle },
                          label: { ...inputLabelStyle },
                        }}
                      />
                      <TextInput
                        label="Additional notes"
                        placeholder="Optional note"
                        {...form.getInputProps('comment')}
                        styles={{
                          input: { ...inputInputStyle },
                          label: { ...inputLabelStyle },
                        }}
                      />

                      <Group style={{ justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <Button
                          variant="subtle"
                          color={COLORS.mutedText}
                          onClick={handleBack}
                        >
                          Back
                        </Button>
                        <Button type="submit" loading={mutation.isPending}>
                          Confirm
                        </Button>
                      </Group>

                      {mutation.isError && (
                        <Alert color="red">Booking failed. Please try again.</Alert>
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          </Overlay>
        )}
      </Transition>
    </Box>
  )
}
