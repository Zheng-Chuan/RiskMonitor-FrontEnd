import { BrowserRouter, Routes, Route } from 'react-router'

import { HomePage } from '@/pages/home-page'
import { SettingsPage } from '@/pages/settings-page'
import { WorkspacePage } from '@/pages/workspace-page'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
