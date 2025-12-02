import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginPage() {
  const { t } = useTranslation()

  // Theme state - default to system to respect system preferences
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "system"
  })

  // Track effective theme (light or dark) for reactive styling
  const [isDark, setIsDark] = useState(() => {
    if (theme === "light") return false
    if (theme === "dark") return true
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Apply theme on mount and when theme changes
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove("dark", "theme-light")

    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(systemPrefersDark)
      document.documentElement.classList.toggle("dark", systemPrefersDark)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches)
        document.documentElement.classList.remove("theme-light")
        document.documentElement.classList.toggle("dark", e.matches)
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else if (theme === "light") {
      setIsDark(false)
      document.documentElement.classList.add("theme-light")
    } else {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [theme])

  // Listen for theme changes from other pages
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    // Also check periodically in case of same-tab updates
    const interval = setInterval(() => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      if (savedTheme && savedTheme !== theme) {
        setTheme(savedTheme)
      }
    }, 100)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [theme])

  // Theme-aware color helpers - use isDark state for reactivity
  const getBgColor = () => {
    return isDark ? "bg-[#21252B]" : "bg-gray-50"
  }

  const getCardBg = () => {
    return isDark ? "bg-[#282C34]" : "bg-white"
  }

  const getCardBorder = () => {
    return isDark ? "border-[#3E4451]" : "border-gray-200"
  }

  const getTitleColor = () => {
    return isDark ? "text-[#ABB2BF]" : "text-gray-900"
  }

  const getTextColor = () => {
    return isDark ? "text-[#5C6370]" : "text-gray-600"
  }

  const getButtonHover = () => {
    return isDark ? "hover:bg-[#1E2025]" : "hover:bg-gray-200"
  }

  const getButtonTextColor = () => {
    return isDark ? "" : "text-gray-900"
  }

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth login endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'https://backend-service-1076130420823.asia-east1.run.app'
    window.location.href = `${apiUrl}/api/v1/user/login/google`
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${getBgColor()} px-4 transition-colors`}>
      <div className="w-full max-w-md">
        <Card className={`${getCardBorder()} ${getCardBg()} shadow-lg transition-colors`}>
          <CardHeader className="text-center space-y-2">
            <CardTitle className={`text-3xl font-semibold ${getTitleColor()} transition-colors`}>
              {t("login.title")}
            </CardTitle>
            <p className={`text-sm ${getTextColor()} transition-colors`}>
              {t("login.subtitle")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              className={`w-full flex items-center justify-center gap-3 h-12 text-base ${getButtonHover()} ${getButtonTextColor()}`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("login.continueWithGoogle")}
            </Button>
            <p className={`text-xs text-center ${getTextColor()} transition-colors mt-4`}>
              {t("login.agreement")}{" "}
              <Link to="/terms-of-service" className="text-blue-500 hover:underline">
                {t("login.termsOfService")}
              </Link>
              {" "}{t("login.and")}{" "}
              <Link to="/privacy-policy" className="text-blue-500 hover:underline">
                {t("login.privacyPolicy")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

