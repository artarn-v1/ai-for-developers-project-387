import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Title,
  Loader,
  Alert,
  Badge,
  Group,
  Button,
  Select,
  Flex,
  Text,
  Modal,
  Box,
  Stack,
  Divider,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import dayjs from 'dayjs'
import { getMeetings, getMeetingTypes, updateMeetingStatus } from '../../api/admin.ts'
import { COLORS } from '../../theme.ts'
import type { components } from '../../types/api.ts'
type MeetingResponse = components['schemas']['Admin.MeetingResponse']

const cellStyle: React.CSSProperties = {
  color: COLORS.text,
  borderColor: COLORS.border,
}

const headerStyle: React.CSSProperties = {
  color: COLORS.mutedText,
  borderColor: COLORS.border,
}

export default function MeetingsPage() {
  const { adminSlug } = useParams<{ adminSlug: string }>()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<MeetingResponse | null>(null)

  const [dateStartFrom, setDateStartFrom] = useState<string | null>(dayjs().format('MMMM D, YYYY'))
  const [dateStartTo, setDateStartTo] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [meetingTypeId, setMeetingTypeId] = useState<string | null>(null)

  const activeFilters = {
    ...(dateStartFrom && { dateStartFrom: new Date(dateStartFrom).toISOString() }),
    ...(dateStartTo && { dateStartTo: new Date(dateStartTo).toISOString() }),
    ...(statusFilter === 'confirmed' && { isConfirmed: true }),
    ...(statusFilter === 'declined' && { isConfirmed: false }),
    ...(meetingTypeId && { meetingTypeId }),
  }

  const { data: meetings, isLoading, error } = useQuery({
    queryKey: ['meetings', adminSlug, activeFilters],
    queryFn: () => getMeetings(adminSlug!, activeFilters),
    enabled: !!adminSlug,
  })

  const { data: meetingTypes } = useQuery({
    queryKey: ['meeting-types', adminSlug],
    queryFn: () => getMeetingTypes(adminSlug!),
    enabled: !!adminSlug,
  })

  const meetingTypeOptions = meetingTypes?.map((mt) => ({ value: mt.id, label: mt.name })) ?? []

  const mutation = useMutation({
    mutationFn: (meetingId: string) =>
      updateMeetingStatus(adminSlug!, meetingId, {
        isConfirmed: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', adminSlug] })
    },
  })

  if (isLoading) return <Loader />
  if (error) return <Alert color="red">Failed to load meetings</Alert>

  return (
    <>
      <Title order={4} mb="md" style={{ color: COLORS.text }}>
        Meetings
      </Title>

      <Flex gap="md" mb="md" align="end" wrap="wrap" style={{ background: COLORS.cardBg, padding: 12, borderRadius: 8 }}>
        <DateInput
          value={dateStartFrom}
          onChange={setDateStartFrom}
          clearable
          label="Date from"
          placeholder="From"
          popoverProps={{ styles: { dropdown: { background: COLORS.cardBg, borderColor: COLORS.border } } }}
          styles={{
            label: { color: COLORS.text },
            input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
            levelsGroup: { background: COLORS.cardBg },
            month: { background: COLORS.cardBg },
            monthCell: { color: COLORS.text },
            day: { color: COLORS.text },
            weekday: { color: COLORS.mutedText },
            calendarHeader: { color: COLORS.text },
            calendarHeaderLevel: { color: COLORS.text },
            calendarHeaderControl: { color: COLORS.text },
          }}
        />
        <DateInput
          value={dateStartTo}
          onChange={setDateStartTo}
          clearable
          label="Date to"
          placeholder="To"
          popoverProps={{ styles: { dropdown: { background: COLORS.cardBg, borderColor: COLORS.border } } }}
          styles={{
            label: { color: COLORS.text },
            input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
            levelsGroup: { background: COLORS.cardBg },
            month: { background: COLORS.cardBg },
            monthCell: { color: COLORS.text },
            day: { color: COLORS.text },
            weekday: { color: COLORS.mutedText },
            calendarHeader: { color: COLORS.text },
            calendarHeaderLevel: { color: COLORS.text },
            calendarHeaderControl: { color: COLORS.text },
          }}
        />
        <Select
          label="Status"
          placeholder="All"
          clearable
          value={statusFilter === 'all' ? null : statusFilter}
          onChange={(v) => setStatusFilter(v ?? 'all')}
          data={[
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'declined', label: 'Declined' },
          ]}
          styles={{
            label: { color: COLORS.text },
            input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
            dropdown: { background: COLORS.cardBg, borderColor: COLORS.border },
            option: { color: COLORS.text },
          }}
        />
        <Select
          label="Meeting type"
          placeholder="All types"
          clearable
          value={meetingTypeId}
          onChange={(v) => setMeetingTypeId(v as string | null)}
          data={meetingTypeOptions}
          styles={{
            label: { color: COLORS.text },
            input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
            dropdown: { background: COLORS.cardBg, borderColor: COLORS.border },
            option: { color: COLORS.text },
          }}
        />
      </Flex>

      <Table withRowBorders style={{ background: COLORS.cardBg, borderRadius: 8 }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={headerStyle}>Date</Table.Th>
            <Table.Th style={headerStyle}>Type</Table.Th>
            <Table.Th style={headerStyle}>Initiator</Table.Th>
            <Table.Th style={headerStyle}>Confirmed</Table.Th>
            <Table.Th style={headerStyle}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {meetings?.map((m) => (
            <Table.Tr key={m.id}>
              <Table.Td style={cellStyle}>{new Date(m.startDateTime).toLocaleString()}</Table.Td>
              <Table.Td style={cellStyle}>{m.meetingType.name}</Table.Td>
              <Table.Td style={cellStyle}>{m.initiator.name}</Table.Td>
              <Table.Td style={cellStyle}>
                <Badge color={m.isConfirmed ? 'green' : 'yellow'}>
                  {m.isConfirmed ? 'Confirmed' : 'Declined'}
                </Badge>
              </Table.Td>
              <Table.Td style={cellStyle}>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setSelected(m)}
                  >
                    View
                  </Button>
                  {!m.isConfirmed && (
                    <Button
                      size="xs"
                      loading={mutation.isPending}
                      onClick={() => mutation.mutate(m.id)}
                    >
                      Confirm
                    </Button>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={!!selected}
        onClose={() => setSelected(null)}
        title="Meeting Details"
        centered
        size="lg"
        styles={{
          content: { background: COLORS.cardBg, border: `1px solid ${COLORS.border}` },
          header: { background: COLORS.cardBg },
          title: { color: COLORS.text, fontWeight: 600 },
          body: { background: COLORS.cardBg },
          close: { color: COLORS.text },
        }}
        overlayProps={{ style: { background: 'rgba(0,0,0,0.6)' } }}
      >
        {selected && (
          <Stack gap="md">
            <Box>
              <Text size="sm" c={COLORS.mutedText}>Meeting Type</Text>
              <Text c={COLORS.text} fw={500}>{selected.meetingType.name}</Text>
              <Text size="sm" c={COLORS.mutedText}>{selected.meetingType.description}</Text>
            </Box>

            <Divider color={COLORS.border} />

            <Group grow>
              <Box>
                <Text size="sm" c={COLORS.mutedText}>Date & Time</Text>
                <Text c={COLORS.text}>{new Date(selected.startDateTime).toLocaleString()}</Text>
              </Box>
              <Box>
                <Text size="sm" c={COLORS.mutedText}>Status</Text>
                <Badge color={selected.isConfirmed ? 'green' : 'yellow'}>
                  {selected.isConfirmed ? 'Confirmed' : 'Declined'}
                </Badge>
              </Box>
            </Group>

            <Divider color={COLORS.border} />

            <Box>
              <Text size="sm" c={COLORS.mutedText}>Initiator</Text>
              <Text c={COLORS.text}>{selected.initiator.name}</Text>
              <Text size="sm" c={COLORS.mutedText}>{selected.initiator.email}</Text>
            </Box>

            {selected.participants.length > 0 && (
              <>
                <Divider color={COLORS.border} />
                <Box>
                  <Text size="sm" c={COLORS.mutedText}>Participants</Text>
                  {selected.participants.map((p) => (
                    <Box key={p.id} mb={4}>
                      <Text c={COLORS.text}>{p.name}</Text>
                      <Text size="sm" c={COLORS.mutedText}>{p.email}</Text>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {selected.comment && (
              <>
                <Divider color={COLORS.border} />
                <Box>
                  <Text size="sm" c={COLORS.mutedText}>Comment</Text>
                  <Text c={COLORS.text}>{selected.comment}</Text>
                </Box>
              </>
            )}
          </Stack>
        )}
      </Modal>
    </>
  )
}
