import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CoupleProvider } from './context/CoupleContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { CalendarPage } from './pages/CalendarPage'
import { IdeasPage } from './pages/IdeasPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <CoupleProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="ideas" element={<IdeasPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </CoupleProvider>
  )
}
