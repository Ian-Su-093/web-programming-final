import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { DashboardPage } from "@/pages/DashboardPage"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { OutlinePage } from "@/pages/OutlinePage"
import { UploadPage } from "@/pages/UploadPage"
import { WebDesignPage } from "@/pages/WebDesignPage"
import { FullPageWebPreviewPage } from "@/pages/FullPageWebPreviewPage"
import { TermsOfServicePage } from "@/pages/TermsOfServicePage"
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage"
import { OAuthCallbackPage } from "@/pages/OAuthCallbackPage"
import { CourseUploadRedirectPage } from "@/pages/CourseUploadRedirectPage"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback/google" element={<OAuthCallbackPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/preferences"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/help-center"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/:id/upload" element={<CourseUploadRedirectPage />} />
          <Route path="/:id/outline" element={<OutlinePage />} />
          <Route path="/:id/web-design" element={<WebDesignPage />} />
          <Route path="/:id/web-preview" element={<FullPageWebPreviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
