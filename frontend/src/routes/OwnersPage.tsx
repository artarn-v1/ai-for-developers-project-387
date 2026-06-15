import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader, Alert } from '@mantine/core'
import { getOwners } from '../api/user.ts'
import { COLORS } from '../theme.ts'

export default function OwnersPage() {
  const navigate = useNavigate()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['owners'],
    queryFn: getOwners,
  })

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
    background: COLORS.cardBg,
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    overflow: 'hidden',
  }

  if (isLoading) return <Loader />
  if (error) return <Alert color="red">Не удалось загрузить список владельцев</Alert>
  if (!data || data.length === 0) {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', padding: 24 }}>
        <div style={{ maxWidth: 768, margin: '0 auto' }}>
          <div style={cardStyle}>
            <div style={{ padding: 24, color: COLORS.mutedText, textAlign: 'center' }}>
              Нет доступных владельцев
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 768, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data?.map((owner, idx) => {
          const initial = owner.name.charAt(0).toUpperCase()
          return (
            <div
              key={owner.clientSlug}
              style={{
                ...cardStyle,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                backgroundColor: hoveredIdx === idx ? COLORS.border : COLORS.cardBg,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => navigate(`/client/${owner.clientSlug}`)}
            >
              <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={avatarStyle}>{initial}</div>
                <div>
                  <div style={{ color: COLORS.text, fontSize: 20, fontWeight: 700 }}>
                    {owner.name}
                  </div>
                  <div style={{ color: COLORS.mutedText, fontSize: 14, marginTop: 4 }}>
                    {owner.timeZone}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
