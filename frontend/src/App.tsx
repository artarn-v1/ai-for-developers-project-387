import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader } from '@mantine/core'

const AdminLayout = lazy(() => import('./routes/admin/AdminLayout'))
const ClientLayout = lazy(() => import('./routes/client/ClientLayout'))
const MeetingTypesPage = lazy(() => import('./routes/admin/MeetingTypesPage'))
const MeetingsPage = lazy(() => import('./routes/admin/MeetingsPage'))
const ClientMeetingTypesPage = lazy(() => import('./routes/client/MeetingTypesPage'))
const CalendarPage = lazy(() => import('./routes/client/CalendarPage'))
const OwnersPage = lazy(() => import('./routes/OwnersPage'))
const NotFound = lazy(() => import('./routes/NotFound'))

function App() {
  return (
    <main>
      <Suspense fallback={<Loader style={{ margin: '40vh auto', display: 'block' }} />}>
        <Routes>
          <Route path="/" element={<OwnersPage />} />
          <Route path="/admin/:adminSlug" element={<AdminLayout />}>
            <Route index element={<Navigate to="meeting-types" replace />} />
            <Route path="meeting-types" element={<MeetingTypesPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
          </Route>
          <Route path="/client/:ownerSlug" element={<ClientLayout />}>
            <Route index element={<ClientMeetingTypesPage />} />
            <Route path=":meetingTypeSlug" element={<CalendarPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </main>
  )
}

export default App
