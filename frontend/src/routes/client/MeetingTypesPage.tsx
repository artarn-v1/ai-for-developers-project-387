import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader, Alert } from '@mantine/core'
import { getActiveMeetingTypes } from '../../api/user.ts'
import { COLORS } from '../../theme.ts'

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
    background: COLORS.avatarBg,
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
    background: COLORS.cardBg,
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
  }

  if (isLoading) return <Loader />
  if (error) return <Alert color="red">Не удалось загрузить типы встреч</Alert>
  if (!data || data.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ padding: 24, color: COLORS.mutedText, textAlign: 'center' }}>
          У этого пользователя пока нет доступных встреч
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      {/* Profile section - avatar on top, name below */}
      <div style={{ padding: '24px 24px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={avatarStyle}>{ownerInitial}</div>
        <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700 }}>
          {ownerName}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${COLORS.border}` }} />

      {/* Meeting types list */}
      {data?.map((mt, idx) => (
        <div
          key={mt.slug}
          style={{
            padding: '16px 24px',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            backgroundColor: hoveredIdx === idx ? COLORS.border : 'transparent',
            borderBottom: idx < (data?.length ?? 0) - 1
              ? `1px solid ${COLORS.border}`
              : 'none',
          }}
          onMouseEnter={() => setHoveredIdx(idx)}
          onMouseLeave={() => setHoveredIdx(null)}
          onClick={() => navigate(`/client/${ownerSlug}/${mt.slug}`)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: COLORS.text, fontSize: 16, fontWeight: 500 }}>
                {mt.name}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: COLORS.slotOccupied,
                color: COLORS.mutedText,
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
