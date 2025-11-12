import { useState, useEffect } from "react"
import { Monitor } from "lucide-react"

export function FullPageWebPreviewPage() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "dark"
  })

  // Listen for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
    window.addEventListener("storage", handleStorageChange)
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

  // Theme-aware color helpers
  const getBgColor = () => {
    if (theme === "light") return "bg-gray-50"
    return "bg-[#1E2025]"
  }

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#5B6B83]"
  }

  const getDividerColor = () => {
    if (theme === "light") return "bg-gray-200"
    return "bg-[#3E4451]"
  }

  return (
    <div className={`h-screen w-screen ${getBgColor()} flex flex-col`}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <h2 className={`text-sm font-semibold ${getMutedText()} uppercase tracking-[0.4rem] mb-4`}>
            Web Preview
          </h2>
        </div>
        <div className={`w-full h-px ${getDividerColor()} mb-6`}></div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {/* Embedded preview - always light theme */}
        <div className="w-full h-full min-h-[400px] bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">
                Web preview will appear here
              </p>
              <p className="text-gray-500 text-sm mt-2">
                As you modify the layout, the preview will update in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

