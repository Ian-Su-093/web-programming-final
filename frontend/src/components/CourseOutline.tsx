import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { BookOpen, ChevronFirst, ChevronLast } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent } from "@/components/ui/card"

interface CourseOutlineProps {
  onToggleChat: () => void
  isChatHidden: boolean
  isSwapped?: boolean
  markdown?: string
}

export function CourseOutline({ onToggleChat, isChatHidden, isSwapped = false, markdown }: CourseOutlineProps) {
  const { t } = useTranslation()

  // Version dropdown state
  const [selectedVersion, setSelectedVersion] = useState<string>("1")
  const [showVersionDropdown, setShowVersionDropdown] = useState(false)
  const versionDropdownRef = useRef<HTMLDivElement>(null)

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

  const getTextColor = () => {
    if (theme === "light") return "text-gray-800"
    return "text-[#E0E0E0]"
  }

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#5B6B83]"
  }

  const getHoverBg = () => {
    if (theme === "light") return "hover:bg-gray-100"
    return "hover:bg-[#3E4451]"
  }

  const getCardBg = () => {
    if (theme === "light") return "bg-white"
    return "bg-[#111620]"
  }

  const getDividerColor = () => {
    if (theme === "light") return "bg-gray-200"
    return "bg-[#3E4451]"
  }

  const getCardSurface = () => {
    if (theme === "light") return "bg-gray-100"
    return "bg-[#282C34]"
  }

  const getBorderColor = () => {
    if (theme === "light") return "border-gray-200"
    return "border-[#3E4451]"
  }

  // Handle clicks outside version dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        versionDropdownRef.current &&
        !versionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowVersionDropdown(false)
      }
    }

    if (showVersionDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showVersionDropdown])


  return (
    <div className={`h-screen ${getBgColor()} flex flex-col`}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 justify-between">
            <div className="flex items-center gap-2">
              {!isSwapped && (
                <button
                  onClick={onToggleChat}
                  className={`${getHoverBg()} rounded p-1 transition-colors`}
                  aria-label={t("outline.courseOutline.toggleChat")}
                >
                  {isChatHidden ? (
                    <ChevronLast className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  ) : (
                    <ChevronFirst className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  )}
                </button>
              )}
              <h2 className={`text-sm font-semibold ${getMutedText()} uppercase tracking-[0.4rem]`}>
                {t("outline.courseOutline.title")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={versionDropdownRef}>
                <button
                  onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md ${getCardSurface()} border ${getBorderColor()} ${getTextColor()} text-sm font-medium transition-colors ${getHoverBg()} min-w-[100px]`}
                >
                  <span>{t("outline.courseOutline.versionNumber", { number: selectedVersion })}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showVersionDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showVersionDropdown && (
                  <div className={`absolute top-full right-0 mt-2 rounded-md ${getCardBg()} border ${getBorderColor()} shadow-lg z-50 overflow-hidden min-w-[100px]`}>
                    <button
                      onClick={() => {
                        setSelectedVersion("1")
                        setShowVersionDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${selectedVersion === "1"
                        ? `${getCardSurface()} ${getTextColor()} font-medium`
                        : `${getTextColor()} ${getHoverBg()}`
                        }`}
                    >
                      {t("outline.courseOutline.versionNumber", { number: "1" })}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVersion("2")
                        setShowVersionDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors border-t ${getBorderColor()} ${selectedVersion === "2"
                        ? `${getCardSurface()} ${getTextColor()} font-medium`
                        : `${getTextColor()} ${getHoverBg()}`
                        }`}
                    >
                      {t("outline.courseOutline.versionNumber", { number: "2" })}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVersion("3")
                        setShowVersionDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors border-t ${getBorderColor()} ${selectedVersion === "3"
                        ? `${getCardSurface()} ${getTextColor()} font-medium`
                        : `${getTextColor()} ${getHoverBg()}`
                        }`}
                    >
                      {t("outline.courseOutline.versionNumber", { number: "3" })}
                    </button>
                  </div>
                )}
              </div>
              {isSwapped && (
                <button
                  onClick={onToggleChat}
                  className={`${getHoverBg()} rounded p-1 transition-colors`}
                  aria-label={t("outline.courseOutline.toggleChat")}
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

        {markdown && (
          <div className={`w-full h-px ${getDividerColor()} mb-6`}></div>
        )}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {!markdown ? (
          <Card className="h-full min-h-[400px]">
            <CardContent className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <BookOpen className={`w-16 h-16 mx-auto ${theme === "light" ? "text-gray-400" : "text-[#5C6370]"} mb-4`} />
                <p className={`${theme === "light" ? "text-gray-600" : "text-[#ABB2BF]"} text-lg`}>
                  {t("outline.courseOutline.emptyState")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={`prose prose-sm max-w-none ${theme === "light" ? "prose-gray" : "prose-invert"} ${getTextColor()}`}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className={`text-2xl font-bold mb-4 ${getTextColor()}`}>{children}</h1>,
                h2: ({ children }) => <h2 className={`text-xl font-semibold mb-3 ${getTextColor()}`}>{children}</h2>,
                h3: ({ children }) => <h3 className={`text-lg font-semibold mb-2 ${getTextColor()}`}>{children}</h3>,
                h4: ({ children }) => <h4 className={`text-base font-semibold mb-2 ${getTextColor()}`}>{children}</h4>,
                p: ({ children }) => <p className={`mb-4 ${getTextColor()} leading-relaxed`}>{children}</p>,
                ul: ({ children }) => <ul className={`list-disc list-inside mb-4 space-y-1 ${getTextColor()}`}>{children}</ul>,
                ol: ({ children }) => <ol className={`list-decimal list-inside mb-4 space-y-1 ${getTextColor()}`}>{children}</ol>,
                li: ({ children }) => <li className={`${getTextColor()}`}>{children}</li>,
                code: ({ children }) => (
                  <code className={`px-1.5 py-0.5 rounded text-sm ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-[#282C34] text-[#ABB2BF]"}`}>
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className={`p-4 rounded-lg mb-4 overflow-x-auto ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-[#282C34] text-[#ABB2BF]"}`}>
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className={`border-l-4 pl-4 my-4 ${theme === "light" ? "border-gray-300 text-gray-700" : "border-[#61AFEF] text-[#ABB2BF]"}`}>
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a href={href} className={`underline ${theme === "light" ? "text-blue-600 hover:text-blue-800" : "text-[#61AFEF] hover:text-[#82C6FF]"}`}>
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className={`font-semibold ${getTextColor()}`}>{children}</strong>,
                em: ({ children }) => <em className={`italic ${getTextColor()}`}>{children}</em>,
                hr: () => <hr className={`my-4 ${getDividerColor()}`} />,
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

