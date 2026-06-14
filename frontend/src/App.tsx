import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './routes/admin/AdminLayout'
import ClientLayout from './routes/client/ClientLayout'
import MeetingTypesPage from './routes/admin/MeetingTypesPage'
import MeetingsPage from './routes/admin/MeetingsPage'
import ClientMeetingTypesPage from './routes/client/MeetingTypesPage'
import BookingPage from './routes/client/BookingPage'
import NotFound from './routes/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/demo" replace />} />
      <Route path="/admin/:adminSlug" element={<AdminLayout />}>
        <Route index element={<Navigate to="meeting-types" replace />} />
        <Route path="meeting-types" element={<MeetingTypesPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
      </Route>
      <Route path="/client/:ownerSlug" element={<ClientLayout />}>
        <Route index element={<ClientMeetingTypesPage />} />
        <Route path=":meetingTypeSlug/book" element={<BookingPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
