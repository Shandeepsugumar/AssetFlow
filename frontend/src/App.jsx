import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AssetRegistration from './pages/asset-registration/AssetRegistration.jsx'
import AllocationTransfer from './pages/allocation-transfer/AllocationTransfer.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AssetRegistration />} />
        <Route path="/allocation-transfer" element={<AllocationTransfer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
