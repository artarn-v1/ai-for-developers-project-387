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
} from '@mantine/core'
import { getMeetings, updateMeetingStatus } from '../../api/admin.ts'
import { CodeBlock } from '../../components/CodeBlock.tsx'
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['meetings', adminSlug],
    queryFn: () => getMeetings(adminSlug!),
    enabled: !!adminSlug,
  })

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
      <Table withRowBorder style={{ background: COLORS.cardBg, borderRadius: 8 }}>
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
          {data?.map((m) => (
            <Table.Tr key={m.id}>
              <Table.Td style={cellStyle}>{new Date(m.startDateTime).toLocaleString()}</Table.Td>
              <Table.Td style={cellStyle}>{m.meetingType.name}</Table.Td>
              <Table.Td style={cellStyle}>{m.initiator.name}</Table.Td>
              <Table.Td style={cellStyle}>
                <Badge color={m.isConfirmed ? 'green' : 'yellow'}>
                  {m.isConfirmed ? 'Confirmed' : 'Pending'}
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

      {selected && (
        <Alert
          title="Meeting Details (JSON)"
          withCloseButton
          onClose={() => setSelected(null)}
          mt="md"
          styles={{
            root: { background: COLORS.cardBg, borderColor: COLORS.border },
            title: { color: COLORS.text },
            message: { color: COLORS.text },
            closeButton: { color: COLORS.mutedText },
          }}
        >
          <CodeBlock code={selected} />
        </Alert>
      )}
    </>
  )
}
