import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Title, Loader, Alert, Switch, CopyButton, Button, TextInput, NumberInput, Stack, Box, Modal, Group } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { getOwner, getMeetingTypes, updateMeetingTypeStatus, createMeetingType } from '../../api/admin.ts'
import { COLORS } from '../../theme.ts'

const cellStyle: React.CSSProperties = {
  color: COLORS.text,
  borderColor: COLORS.border,
}

const headerStyle: React.CSSProperties = {
  color: COLORS.mutedText,
  borderColor: COLORS.border,
}

export default function MeetingTypesPage() {
  const { adminSlug } = useParams<{ adminSlug: string }>()
  const queryClient = useQueryClient()
  const [opened, { open, close }] = useDisclosure(false)

  const { data: owner } = useQuery({
    queryKey: ['owner', adminSlug],
    queryFn: () => getOwner(adminSlug!),
    enabled: !!adminSlug,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['meeting-types', adminSlug],
    queryFn: () => getMeetingTypes(adminSlug!),
    enabled: !!adminSlug,
  })

  const toggleMutation = useMutation({
    mutationFn: ({
      meetingTypeId,
      isActive,
    }: {
      meetingTypeId: string
      isActive: boolean
    }) => updateMeetingTypeStatus(adminSlug!, meetingTypeId, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-types', adminSlug] })
    },
  })

  const createForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      description: '',
      availableFrom: '',
      availableTo: '',
      durationMinutes: 30,
      slug: '',
      isActive: true,
    },
    validate: {
      name: (val: string) => (val.trim().length > 0 ? null : 'Name is required'),
      description: (val: string) => (val.trim().length > 0 ? null : 'Description is required'),
      availableFrom: (val: string) => (/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(val) ? null : 'Invalid time (HH:MM)'),
      availableTo: (val: string) => (/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(val) ? null : 'Invalid time (HH:MM)'),
      durationMinutes: (val: number) => (val > 0 ? null : 'Must be positive'),
      slug: (val: string) => (/^[a-z0-9-]+$/.test(val) ? null : 'Only lowercase letters, numbers, hyphens'),
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: typeof createForm.values) =>
      createMeetingType(adminSlug!, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting-types', adminSlug] })
      createForm.reset()
      close()
    },
  })

  if (isLoading) return <Loader />
  if (error) return <Alert color="red">Failed to load meeting types</Alert>

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={4} style={{ color: COLORS.text }}>
          Meeting Types
        </Title>
        <Group gap="xs">
          <CopyButton value={`${window.location.origin}/client/${owner?.clientSlug ?? adminSlug}`}>
            {({ copied, copy }) => (
              <Button size="xs" color={copied ? 'green' : 'blue'} onClick={copy}>
                {copied ? 'Copied' : 'Copy client link'}
              </Button>
            )}
          </CopyButton>
          <Button onClick={open}>Создать</Button>
        </Group>
      </Group>

      <Table withRowBorders style={{ background: COLORS.cardBg, borderRadius: 8 }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={headerStyle}>Name</Table.Th>
            <Table.Th style={headerStyle}>Slug</Table.Th>
            <Table.Th style={headerStyle}>Duration</Table.Th>
            <Table.Th style={headerStyle}>Available</Table.Th>
            <Table.Th style={headerStyle}>Active</Table.Th>
            <Table.Th style={headerStyle}>Client Link</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data?.map((mt) => (
            <Table.Tr key={mt.id}>
              <Table.Td style={cellStyle}>{mt.name}</Table.Td>
              <Table.Td style={cellStyle}>{mt.slug}</Table.Td>
              <Table.Td style={cellStyle}>{mt.durationMinutes}m</Table.Td>
              <Table.Td style={cellStyle}>{mt.availableFrom}-{mt.availableTo}</Table.Td>
              <Table.Td style={cellStyle}>
                <Switch
                  defaultChecked={mt.isActive}
                  onChange={(event) => {
                    toggleMutation.mutate({
                      meetingTypeId: mt.id,
                      isActive: event.currentTarget.checked,
                    })
                  }}
                />
              </Table.Td>
              <Table.Td style={cellStyle}>
                <CopyButton value={`${window.location.origin}/client/${owner?.clientSlug ?? adminSlug}/${mt.slug}`}>
                  {({ copied, copy }) => (
                    <Button size="xs" color={copied ? 'green' : 'blue'} onClick={copy}>
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  )}
                </CopyButton>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={close}
        title="Создать тип встречи"
        centered
        styles={{
          content: { background: COLORS.cardBg, border: `1px solid ${COLORS.border}` },
          header: { background: COLORS.cardBg },
          title: { color: COLORS.text },
          body: { background: COLORS.cardBg },
          close: { color: COLORS.text },
        }}
        overlayProps={{ style: { background: 'rgba(0,0,0,0.6)' } }}
      >
        <Box component="form" onSubmit={createForm.onSubmit((values) => createMutation.mutate(values))}>
          <Stack>
            <TextInput
              label="Name"
              placeholder="Personal oil change"
              key={createForm.key('name')}
              styles={{
                label: { color: COLORS.text },
                input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
              }}
              {...createForm.getInputProps('name')}
            />
            <TextInput
              label="Description"
              placeholder="Reminder about oil change"
              key={createForm.key('description')}
              styles={{
                label: { color: COLORS.text },
                input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
              }}
              {...createForm.getInputProps('description')}
            />
            <TextInput
              label="Slug"
              placeholder="personal-oil-change"
              key={createForm.key('slug')}
              styles={{
                label: { color: COLORS.text },
                input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
              }}
              {...createForm.getInputProps('slug')}
            />
            <TextInput
              label="Available From"
              placeholder="09:00"
              key={createForm.key('availableFrom')}
              styles={{
                label: { color: COLORS.text },
                input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
              }}
              {...createForm.getInputProps('availableFrom')}
            />
            <TextInput
              label="Available To"
              placeholder="18:00"
              key={createForm.key('availableTo')}
              styles={{
                label: { color: COLORS.text },
                input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
              }}
              {...createForm.getInputProps('availableTo')}
            />
            <NumberInput
              label="Duration (minutes)"
              placeholder="30"
              min={1}
              key={createForm.key('durationMinutes')}
              styles={{
                label: { color: COLORS.text },
                input: { background: COLORS.inputBg, borderColor: COLORS.inputBorder, color: COLORS.text },
              }}
              {...createForm.getInputProps('durationMinutes')}
            />
            <Switch
              label="Active"
              key={createForm.key('isActive')}
              styles={{ label: { color: COLORS.text } }}
              {...createForm.getInputProps('isActive', { type: 'checkbox' })}
            />
            <Button type="submit" loading={createMutation.isPending}>
              Create
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  )
}
