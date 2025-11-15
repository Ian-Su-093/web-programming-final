import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ChevronFirst, ChevronLast, Monitor, ExternalLink } from "lucide-react"

interface WebPreviewProps {
  onToggleChat: () => void
  onHidePreview?: () => void
  onShowChat?: () => void
  isChatHidden: boolean
  isSwapped?: boolean
  id?: string
}

export function WebPreview({ onToggleChat, onHidePreview, onShowChat, isChatHidden, isSwapped = false, id }: WebPreviewProps) {
  const { t } = useTranslation()
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

  const getHoverBg = () => {
    if (theme === "light") return "hover:bg-gray-100"
    return "hover:bg-[#3E4451]"
  }

  const getDividerColor = () => {
    if (theme === "light") return "bg-gray-200"
    return "bg-[#3E4451]"
  }
  const handleOpenInNewTab = () => {
    // Hide the preview panel in the current tab
    if (onHidePreview) {
      onHidePreview()
    }
    // Show the chat section if it's hidden
    if (isChatHidden && onShowChat) {
      onShowChat()
    }
    // Open the full page preview in a new tab
    if (id) {
      window.open(`/${id}/web-preview`, "_blank")
    }
  }

  return (
    <div className={`h-screen ${getBgColor()} flex flex-col`}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              {!isSwapped && (
                <button
                  onClick={onToggleChat}
                  className={`${getHoverBg()} rounded p-1 transition-colors`}
                  aria-label={t("outline.webDesign.preview.toggleChat")}
                >
                  {isChatHidden ? (
                    <ChevronLast className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  ) : (
                    <ChevronFirst className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  )}
                </button>
              )}
              <h2 className={`text-sm font-semibold ${getMutedText()} uppercase tracking-[0.4rem]`}>
                {t("outline.webDesign.preview.title")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenInNewTab}
                className={`${getHoverBg()} rounded p-1 transition-colors`}
                aria-label={t("outline.webDesign.preview.openInNewTab")}
                title={t("outline.webDesign.preview.openInNewTab")}
              >
                <ExternalLink className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
              </button>
              {isSwapped && (
                <button
                  onClick={onToggleChat}
                  className={`${getHoverBg()} rounded p-1 transition-colors`}
                  aria-label={t("outline.webDesign.preview.toggleChat")}
                >
                  {isChatHidden ? (
                    <ChevronFirst className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  ) : (
                    <ChevronLast className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  )}
                </button>
              )}
            </div>
          </div>
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
                {t("outline.webDesign.preview.emptyState")}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {t("outline.webDesign.preview.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

