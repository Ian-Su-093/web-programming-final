import { useState, useEffect } from "react"
import { BookOpen, ChevronDown, ChevronLeft } from "lucide-react"
import type { CourseData } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CourseOutlineProps {
  courseData: CourseData
}

export function CourseOutline({ courseData }: CourseOutlineProps) {
  const { title, outline } = courseData
  // Initialize with all modules expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(outline.map((item) => item.id))
  )

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
    <div className="h-screen bg-[#1E2025] flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#5B6B83] uppercase tracking-[0.4rem] mb-4">
            Course Outline
          </h2>
          {title && (
            <h3 className="text-xl font-semibold text-[#E0E0E0] mb-6">
              {title}
            </h3>
          )}
        </div>

        {outline.length > 0 && (
          <div className="w-full h-px bg-[#3E4451] mb-6"></div>
        )}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {outline.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-[#5C6370] mb-4" />
                <p className="text-[#5C6370]">
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
                  className="border-[#3E4451] bg-[#111620] hover:border-[#61AFEF]/50 transition-colors"
                >
                  <CardHeader className="py-4 px-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[#5B6B83] tracking-[0.3rem]">
                              MODULE {moduleNumber}
                            </span>
                            {item.week && (
                              <span className="text-xs font-medium text-[#8DB472] bg-[#1C212C] tracking-wider px-2 py-1 rounded-full">
                                WEEK {item.week}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-semibold text-[#E0E0E0] py-1">
                            {item.title}
                          </h3>
                        </div>
                        {isExpanded && item.topics && item.topics.length > 0 && (
                          <ul className="space-y-2 mt-3 list-disc list-inside">
                            {item.topics.map((topic, topicIndex) => (
                              <li key={topicIndex} className="text-sm text-[#E0E0E0]">
                                {topic}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={() => toggleModule(item.id)}
                        className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-[#3E4451] flex items-center justify-center transition-colors"
                        aria-label={isExpanded ? "Collapse module" : "Expand module"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#5C6370]" />
                        ) : (
                          <ChevronLeft className="w-4 h-4 text-[#5C6370]" />
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

