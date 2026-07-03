import { BrowserRouter, Routes, Route } from 'react-router'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>首页</div>} />
        <Route path="/workspace" element={<div>工作区</div>} />
        <Route path="/settings" element={<div>设置</div>} />
      </Routes>
    </BrowserRouter>
  )
}