import { useState, useEffect } from "react"
import { BookOpen, ChevronDown, ChevronLeft, ChevronFirst, ChevronLast } from "lucide-react"
import type { CourseData } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CourseOutlineProps {
  courseData: CourseData
  onToggleChat: () => void
  isChatHidden: boolean
  isSwapped?: boolean
}

export function CourseOutline({ courseData, onToggleChat, isChatHidden, isSwapped = false }: CourseOutlineProps) {
  const { title, outline } = courseData
  // Initialize with all modules expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(outline.map((item) => item.id))
  )

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

  const getCardBorder = () => {
    if (theme === "light") return "border-gray-300"
    return "border-[#3E4451]"
  }

  const getCardHoverBorder = () => {
    if (theme === "light") return "hover:border-blue-400"
    return "hover:border-[#61AFEF]/50"
  }

  const getDividerColor = () => {
    if (theme === "light") return "bg-gray-200"
    return "bg-[#3E4451]"
  }

  // Update expanded modules when outline changes
  useEffect(() => {
    setExpandedModules(new Set(outline.map((item) => item.id)))
  }, [outline])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  return (
    <div className={`h-screen ${getBgColor()} flex flex-col`}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <div className={`flex items-center gap-2 mb-4 ${isSwapped ? "justify-between" : ""}`}>
            {!isSwapped && (
              <button
                onClick={onToggleChat}
                className={`${getHoverBg()} rounded p-1 transition-colors`}
                aria-label="Toggle chat section"
              >
                {isChatHidden ? (
                  <ChevronLast className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                ) : (
                  <ChevronFirst className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                )}
              </button>
            )}
            <h2 className={`text-sm font-semibold ${getMutedText()} uppercase tracking-[0.4rem]`}>
              Course Outline
            </h2>
            {isSwapped && (
              <button
                onClick={onToggleChat}
                className={`${getHoverBg()} rounded p-1 transition-colors`}
                aria-label="Toggle chat section"
              >
                {isChatHidden ? (
                  <ChevronFirst className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                ) : (
                  <ChevronLast className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                )}
              </button>
            )}
          </div>
          {title && (
            <h3 className={`text-xl font-semibold ${getTextColor()} mb-6`}>
              {title}
            </h3>
          )}
        </div>

        {outline.length > 0 && (
          <div className={`w-full h-px ${getDividerColor()} mb-6`}></div>
        )}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {outline.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className={`w-12 h-12 mx-auto ${theme === "light" ? "text-gray-400" : "text-[#5C6370]"} mb-4`} />
                <p className={theme === "light" ? "text-gray-500" : "text-[#5C6370]"}>
                  Course outline will appear here as you chat
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {outline.map((item, index) => {
              const isExpanded = expandedModules.has(item.id)
              const moduleNumber = index + 1

              return (
                <Card
                  key={item.id}
                  className={`${getCardBorder()} ${getCardBg()} ${getCardHoverBorder()} transition-colors`}
                >
                  <CardHeader className="py-4 px-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-3">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                            <span className={`flex-shrink-0 text-xs font-medium ${getMutedText()} tracking-[0.3rem]`}>
                              MODULE {moduleNumber}
                            </span>
                            {item.week && (
                              <span className={`w-full sm:w-auto text-[10px] font-medium text-[#8DB472] ${theme === "light" ? "bg-green-50" : "bg-[#1C212C]"} tracking-wider px-2 py-1 rounded-full text-center sm:text-left`}>
                                WEEK {item.week}
                              </span>
                            )}
                          </div>
                          <h3 className={`text-base font-semibold ${getTextColor()} py-1`}>
                            {item.title}
                          </h3>
                        </div>
                        {isExpanded && item.topics && item.topics.length > 0 && (
                          <ul className="space-y-2 mt-3 list-disc list-inside">
                            {item.topics.map((topic, topicIndex) => (
                              <li key={topicIndex} className={`text-sm ${getTextColor()}`}>
                                {topic}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={() => toggleModule(item.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full ${getHoverBg()} flex items-center justify-center transition-colors`}
                        aria-label={isExpanded ? "Collapse module" : "Expand module"}
                      >
                        {isExpanded ? (
                          <ChevronDown className={`w-4 h-4 ${theme === "light" ? "text-gray-500" : "text-[#5C6370]"}`} />
                        ) : (
                          <ChevronLeft className={`w-4 h-4 ${theme === "light" ? "text-gray-500" : "text-[#5C6370]"}`} />
                        )}
                      </button>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

