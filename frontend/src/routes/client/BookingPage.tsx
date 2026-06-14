import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
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
import { useCallback } from 'react'
import { getMeetingType, createMeeting } from '../../api/user.ts'
import type { components } from '../../types/api.ts'
import { COLORS } from '../../theme.ts'
import type { SelectedDate, SelectedSlot } from './CalendarPage.tsx'

type ClientMeetingResponse = components['schemas']['Client.ClientMeetingResponse']

interface BookingState {
  date: SelectedDate | null
  slot: SelectedSlot | null
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatTimeRange(time: string, durationMinutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const endM = m + durationMinutes
  const endH = h + Math.floor(endM / 60)
  const endMin = endM % 60
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' - ' + String(endH).padStart(2, '0') + ':' + String(endMin).padStart(2, '0')
}

export default function BookingPage() {
  const { ownerSlug, meetingTypeSlug } = useParams<{ ownerSlug: string; meetingTypeSlug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const state = location.state as BookingState | null
  const selectedDate = state?.date ?? null
  const selectedSlot = state?.slot ?? null

  const { data: meetingType, isLoading: typeLoading, error: typeError } = useQuery({
    queryKey: ['client-meeting-type', ownerSlug, meetingTypeSlug],
    queryFn: () => getMeetingType(ownerSlug!, meetingTypeSlug!),
    enabled: !!ownerSlug && !!meetingTypeSlug,
  })

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
        startDateTime: selectedSlot!.dateTime,
        comment: values.comment.trim() || undefined,
        participants: values.participants.map((p) => ({
          name: p.name.trim(),
          email: p.email.trim(),
        })),
      }),
    onSuccess: (data) => {
      // #12: optimistically mark the new slot as occupied so it greys out
      // immediately, without waiting for the refetch round-trip.
      queryClient.setQueryData<ClientMeetingResponse[]>(
        ['client-occupied-slots', ownerSlug, meetingTypeSlug],
        (old) => [...(old ?? []), data],
      )
      queryClient.invalidateQueries({ queryKey: ['client-occupied-slots', ownerSlug, meetingTypeSlug] })
      // Redirect back to the calendar after a successful booking.
      navigate(`/client/${ownerSlug}/${meetingTypeSlug}`, { replace: true })
    },
  })

  const handleConfirm = useCallback((values: typeof form.values) => {
    mutation.mutate(values)
  }, [mutation, form])

  const handleBack = useCallback(() => {
    navigate(`/client/${ownerSlug}/${meetingTypeSlug}`)
  }, [navigate, ownerSlug, meetingTypeSlug])

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

  // No slot chosen (e.g. direct navigation / refresh) -> back to the calendar.
  if (!selectedSlot || !selectedDate) {
    return <Navigate to={`/client/${ownerSlug}/${meetingTypeSlug}`} replace />
  }

  if (typeLoading) return <Loader />
  if (typeError) return <Alert color="red">Ошибка загрузки данных</Alert>
  if (!meetingType) return <Alert color="red">Тип встречи не найден</Alert>

  const selectedDateFormatted =
    DAYS[new Date(selectedDate.year, selectedDate.month, selectedDate.date).getDay()] + ', ' + MONTHS[selectedDate.month] + ' ' + selectedDate.date + ', ' + selectedDate.year

  // #13: dynamic participants list
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
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: 'system-ui, sans-serif',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <Box style={{
        width: '100%',
        maxWidth: 800,
        borderRadius: 16,
        background: COLORS.cardBg,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderStyle: 'solid',
        padding: 32,
        display: 'flex',
        gap: 32,
        position: 'relative',
      }}>
        <CloseButton
          style={{ position: 'absolute', top: 16, right: 16, color: COLORS.mutedText }}
          onClick={handleBack}
        />

        {/* Left: meeting info */}
        <Box style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              flexShrink: 0,
            }}>
              {meetingType.owner.name.charAt(0).toUpperCase()}
            </Box>
            <Text style={{ margin: 0, fontSize: 14, fontWeight: 500, color: COLORS.text }}>
              {meetingType.owner.name}
            </Text>
          </Box>

          <Title order={4} style={{ color: COLORS.text, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {meetingType.name}
          </Title>

          <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            {selectedDateFormatted + '\n' + formatTimeRange(selectedSlot.time, meetingType.durationMinutes)}
          </Text>

          <Text style={{ color: COLORS.mutedText, fontSize: 14, margin: 0 }}>
            {meetingType.durationMinutes + 'm'}
          </Text>
        </Box>

        {/* Right: form */}
        <Box style={{ flex: 1 }}>
          <Box component="form" onSubmit={form.onSubmit(handleConfirm)}>
            <Stack gap={16}>
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

              <Group style={{ justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
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
  )
}
