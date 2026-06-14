import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader, Alert } from '@mantine/core'
import { getActiveMeetingTypes } from '../../api/user.ts'

export default function MeetingTypesPage() {
  const { ownerSlug } = useParams<{ ownerSlug: string }>()
  const navigate = useNavigate()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['client-meeting-types', ownerSlug],
    queryFn: () => getActiveMeetingTypes(ownerSlug!),
    enabled: !!ownerSlug,
  })

  const ownerName = data?.[0]?.owner?.name ?? ownerSlug ?? ''
  const ownerInitial = ownerName.charAt(0).toUpperCase()

  const avatarStyle: React.CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#3f6212',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 500,
    fontFamily: 'system-ui, sans-serif',
    flexShrink: 0,
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: 768,
    margin: '0 auto',
    background: '#27272a',
    borderRadius: 16,
    border: '1px solid #3f3f46',
    overflow: 'hidden',
  }

  if (isLoading) return <Loader />
  if (error) return <Alert color="red">Не удалось загрузить типы встреч</Alert>

  return (
    <div style={cardStyle}>
      {/* Profile section - avatar on top, name below */}
      <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={avatarStyle}>{ownerInitial}</div>
        <div style={{ color: '#f4f4f5', fontSize: 20, fontWeight: 700 }}>
          {ownerName}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #3f3f46' }} />

      {/* Meeting types list */}
      {data?.map((mt, idx) => (
        <div
          key={mt.slug}
          style={{
            padding: '16px 24px',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            backgroundColor: hoveredIdx === idx ? '#3f3f46' : 'transparent',
            borderBottom: idx < (data?.length ?? 0) - 1
              ? '1px solid #3f3f46'
              : 'none',
          }}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
          onClick={() => navigate(`/client/${ownerSlug}/${mt.slug}/book`)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: '#f4f4f5', fontSize: 16, fontWeight: 500 }}>
                {mt.name}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#52525b',
                color: '#a1a1aa',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 13,
                fontWeight: 500,
                alignSelf: 'flex-start',
              }}>
                {mt.durationMinutes}m
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
