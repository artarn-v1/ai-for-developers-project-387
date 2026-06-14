import { Link } from 'react-router-dom'
import { COLORS } from '../theme.ts'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        color: COLORS.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: 48, fontWeight: 700 }}>404</div>
      <div style={{ color: COLORS.mutedText, fontSize: 16 }}>
        Страница не найдена
      </div>
      <Link to="/" style={{ color: COLORS.slotAvailable, marginTop: 8 }}>
        На главную
      </Link>
    </div>
  )
}
