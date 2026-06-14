import { useState } from 'react'
import { Outlet, useParams, Link, useLocation } from 'react-router-dom'
import { AppShell, Group, Title, NavLink } from '@mantine/core'
import { COLORS } from '../../theme.ts'

export default function AdminLayout() {
  const { adminSlug } = useParams<{ adminSlug: string }>()
  const location = useLocation()
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)

  const isActive = (path: string) => location.pathname.includes(path)

  const navLinkStyle = (path: string): React.CSSProperties => ({
    backgroundColor: isActive(path)
      ? COLORS.border
      : hoveredNav === path
        ? COLORS.border
        : 'transparent',
    color: COLORS.text,
    borderRadius: 8,
    transition: 'background-color 0.15s',
  })

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh' }}>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 250, breakpoint: 0 }}
        padding="md"
      >
        <AppShell.Header
          style={{ background: COLORS.cardBg, borderColor: COLORS.border }}
        >
          <Group h="100%" px="md">
            <Title order={3} style={{ color: COLORS.text }}>
              Meeting Booking — Admin
            </Title>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar
          p="xs"
          style={{ background: COLORS.cardBg, borderColor: COLORS.border }}
        >
          <NavLink
            component={Link}
            to={`/admin/${adminSlug}/meeting-types`}
            label="Meeting Types"
            active={isActive('meeting-types')}
            style={navLinkStyle('meeting-types')}
            onMouseEnter={() => setHoveredNav('meeting-types')}
            onMouseLeave={() => setHoveredNav(null)}
          />
          <NavLink
            component={Link}
            to={`/admin/${adminSlug}/meetings`}
            label="Meetings"
            active={isActive('meetings')}
            style={navLinkStyle('meetings')}
            onMouseEnter={() => setHoveredNav('meetings')}
            onMouseLeave={() => setHoveredNav(null)}
          />
        </AppShell.Navbar>
        <AppShell.Main style={{ background: COLORS.bg }}>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </div>
  )
}
