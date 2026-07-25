import { BrowserRouter, Routes, Route } from 'react-router'

import { WorkspacePage } from '@/pages/workspace-page'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkspacePage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
      </Routes>
    </BrowserRouter>
  )
}
