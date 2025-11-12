import { useEffect, useRef, useState } from "react"
import type { MouseEvent as ReactMouseEvent } from "react"
import "@/App.css"
import { ChatSection } from "@/components/ChatSection"
import { CourseOutline } from "@/components/CourseOutline"
import { Sidebar } from "@/components/Sidebar"
import type { CourseData, Message } from "@/types"

const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "I want to build a course that teaches developers how to co-create outlines with AI.",
    timestamp: new Date("2024-04-12T09:27:00"),
  },
  {
    id: "2",
    role: "assistant",
    content: "Great! Tell me about your target learners and how you envision supporting them after each module.",
    timestamp: new Date("2024-04-12T09:27:00"),
  },
  {
    id: "3",
    role: "user",
    content: "They already know React. I need structure that shows how to pair UI craft with AI prompts.",
    timestamp: new Date("2024-04-12T09:29:00"),
  },
  {
    id: "4",
    role: "assistant",
    content: "Understood. I drafted an outline that escalates from foundational UX to advanced AI orchestration. Feel free to iterate further below.",
    timestamp: new Date("2024-04-12T09:30:00"),
  },
]

const mockCourseData: CourseData = {
  title: "AI-Powered Course Design with React & Next.js",
  outline: [
    {
      id: "1",
      title: "Kickoff & Discovery",
      description: "Set a clear product vision and gather course requirements.",
      duration: "Week 1",
      week: 1,
      topics: [
        "Define target learner persona",
        "Capture scope with zod-powered schemas",
        "Map conversational UX flows",
      ],
    },
    {
      id: "2",
      title: "Interface Foundations",
      description: "Craft responsive chat surfaces and outline panes.",
      duration: "Week 2",
      week: 2,
      topics: [
        "Design One Dark Pro inspired UI with Tailwind & shadcn primitives",
        "Structure chat and outline panes in Next.js App Router",
        "Instrument chat state management patterns",
      ],
    },
    {
      id: "3",
      title: "AI Orchestration",
      description: "Integrate AI services that transform chat into structured outlines.",
      duration: "Week 3",
      week: 3,
      topics: [
        "Design system prompts for multi-turn conversation",
        "Stream outline updates with server actions",
        "Build refinement loops with evaluation hooks",
      ],
    },
  ],
}

export function OutlinePage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [courseData, setCourseData] = useState<CourseData>(mockCourseData)
  const [isLoading, setIsLoading] = useState(false)
  const [chatWidth, setChatWidth] = useState(66.67)
  const [isResizing, setIsResizing] = useState(false)
  const [isChatHidden, setIsChatHidden] = useState(false)
  const [isSwapped, setIsSwapped] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I understand you'd like to plan a course. This is a demo response. In a real implementation, this would connect to an AI service to generate course outlines based on your input.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)

      if (content.toLowerCase().includes("course") || content.toLowerCase().includes("outline")) {
        setCourseData({
          title: "AI-Powered Course Design with React & Next.js",
          outline: [
            {
              id: "1",
              title: "Kickoff & Discovery",
              description: "Overview of course planning fundamentals",
              duration: "2 hours",
              week: 1,
              topics: [
                "Define target learner persona",
                "Capture scope with zod-powered schemas",
                "Map conversational UX flows",
              ],
            },
            {
              id: "2",
              title: "Interface Foundations",
              description: "Deep dive into advanced concepts",
              duration: "3 hours",
              week: 2,
              topics: [
                "Design One Dark Pro inspired UI with Tailwind & shadcn primitives",
                "Structure chat and outline panes in Next.js App Router",
                "Instrument chat state management patterns",
              ],
            },
          ],
        })
      }
    }, 1000)
  }

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelsRef.current) return

      const panelsRect = panelsRef.current.getBoundingClientRect()
      const leftPanelWidth = ((e.clientX - panelsRect.left) / panelsRect.width) * 100

      const newChatWidth = isSwapped ? 100 - leftPanelWidth : leftPanelWidth

      const constrainedWidth = Math.max(33.33, Math.min(66.67, newChatWidth))
      setChatWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, isSwapped])

  const handleSwapPanels = () => {
    setIsSwapped(!isSwapped)
  }

  return (
    <div ref={containerRef} className="flex h-screen bg-[#21252B] overflow-hidden">
      <Sidebar />

      {!isChatHidden && (
        <div ref={panelsRef} className="flex flex-1">
          {isSwapped ? (
            <>
              <div className="flex flex-col border-r border-[#3E4451]" style={{ width: `${100 - chatWidth}%` }}>
                <CourseOutline
                  courseData={courseData}
                  onToggleChat={() => setIsChatHidden(!isChatHidden)}
                  isChatHidden={isChatHidden}
                  isSwapped={isSwapped}
                />
              </div>

              <div className="relative group" style={{ userSelect: "none" }}>
                <div
                  className={`w-1 bg-[#3E4451] hover:bg-[#61AFEF] transition-colors h-full ${
                    isResizing ? "bg-[#61AFEF]" : ""
                  }`}
                />
                <div onMouseDown={handleMouseDown} className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
              </div>

              <div className="flex flex-col flex-shrink-0" style={{ width: `${chatWidth}%` }}>
                <ChatSection
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onSwapPanels={handleSwapPanels}
                  isSwapped={isSwapped}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col border-r border-[#3E4451]" style={{ width: `${chatWidth}%` }}>
                <ChatSection
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onSwapPanels={handleSwapPanels}
                  isSwapped={isSwapped}
                />
              </div>

              <div className="relative group" style={{ userSelect: "none" }}>
                <div
                  className={`w-1 bg-[#3E4451] hover:bg-[#61AFEF] transition-colors h-full ${
                    isResizing ? "bg-[#61AFEF]" : ""
                  }`}
                />
                <div onMouseDown={handleMouseDown} className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
              </div>

              <div className="flex flex-col flex-shrink-0" style={{ width: `${100 - chatWidth}%` }}>
                <CourseOutline
                  courseData={courseData}
                  onToggleChat={() => setIsChatHidden(!isChatHidden)}
                  isChatHidden={isChatHidden}
                  isSwapped={isSwapped}
                />
              </div>
            </>
          )}
        </div>
      )}

      {isChatHidden && (
        <div className="flex flex-col flex-1">
          <CourseOutline
            courseData={courseData}
            onToggleChat={() => setIsChatHidden(!isChatHidden)}
            isChatHidden={isChatHidden}
            isSwapped={isSwapped}
          />
        </div>
      )}
    </div>
  )
}

