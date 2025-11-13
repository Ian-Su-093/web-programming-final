import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { DashboardPage } from "@/pages/DashboardPage"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { OutlinePage } from "@/pages/OutlinePage"
import { UploadPage } from "@/pages/UploadPage"
import { WebDesignPage } from "@/pages/WebDesignPage"
import { FullPageWebPreviewPage } from "@/pages/FullPageWebPreviewPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/dashboard" element={<DashboardPage />} />
        <Route path="/user/preferences" element={<DashboardPage />} />
        <Route path="/user/help-center" element={<DashboardPage />} />
        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/:id/upload" element={<UploadPage />} />
        <Route path="/:id/outline" element={<OutlinePage />} />
        <Route path="/:id/web-design" element={<WebDesignPage />} />
        <Route path="/:id/web-preview" element={<FullPageWebPreviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
