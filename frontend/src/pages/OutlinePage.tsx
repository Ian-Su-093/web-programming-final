import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { MouseEvent as ReactMouseEvent } from "react"
import "@/App.css"
import { ChatSection } from "@/components/ChatSection"
import { CourseOutline } from "@/components/CourseOutline"
import { Sidebar } from "@/components/Sidebar"
import type { CourseData, Message } from "@/types"
import { getCourseById, getMessagesByCourseId, convertMessageModelToMessage, createMessage } from "@/lib/api"

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
  const [messages, setMessages] = useState<Message[]>([])
  const [courseData, setCourseData] = useState<CourseData>(mockCourseData)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [chatWidth, setChatWidth] = useState(66.67)
  const [isResizing, setIsResizing] = useState(false)
  const [isChatHidden, setIsChatHidden] = useState(false)
  const [isSwapped, setIsSwapped] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const sendingRef = useRef(false) // Add this ref to track if a send is in progress
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)
  const lastMessageCountRef = useRef<number>(0)

  // Fetch course data and messages on mount
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) {
        return
      }

      try {
        const response = await getCourseById(id)

        // Update course title with actual name from API
        setCourseData((prev) => ({
          ...prev,
          title: response.course.name,
        }))
      } catch (error) {
        console.error("Failed to fetch course data:", error)
        // Keep the mock data on error
      }
    }

    const fetchMessages = async () => {
      if (!id) {
        return
      }

      try {
        const response = await getMessagesByCourseId(id)
        // Convert MessageModel[] to Message[]
        // Filter out null values (messages with null content)
        const convertedMessages = response.messages
          .map(convertMessageModelToMessage)
          .filter((msg): msg is Message => msg !== null)

        setMessages(convertedMessages)
        lastMessageCountRef.current = convertedMessages.length
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        // Keep empty messages on error
      }
    }

    fetchCourseData()
    fetchMessages()

    // Cleanup polling on unmount or id change
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
      setIsPolling(false)
      pollingStartTimeRef.current = null
    }
  }, [id])

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "dark"
  })

  // Apply theme on mount and when theme changes
  useEffect(() => {
    document.documentElement.classList.remove("dark", "theme-light")

    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", systemPrefersDark)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.remove("theme-light")
        document.documentElement.classList.toggle("dark", e.matches)
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else if (theme === "light") {
      document.documentElement.classList.add("theme-light")
    } else {
      document.documentElement.classList.add("dark")
    }
  }, [theme])

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
    if (theme === "light") return "bg-white"
    return "bg-[#21252B]"
  }

  const getBorderColor = () => {
    if (theme === "light") return "border-gray-200"
    return "border-[#3E4451]"
  }

  const getResizerColor = () => {
    if (theme === "light") return "bg-gray-300"
    return "bg-[#3E4451]"
  }

  const handleNextStep = () => {
    if (id) {
      navigate(`/${id}/web-design`)
    }
  }

  // Stop polling function
  const stopPolling = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    setIsPolling(false)
    pollingStartTimeRef.current = null
  }

  // Polling function to check for new assistant messages
  const pollForMessages = async () => {
    if (!id) {
      stopPolling()
      return
    }

    try {
      const response = await getMessagesByCourseId(id)
      const convertedMessages = response.messages
        .map(convertMessageModelToMessage)
        .filter((msg): msg is Message => msg !== null)

      // Check if we have new assistant messages (not tool messages)
      const currentMessageCount = convertedMessages.length
      const hasNewAssistantMessage = convertedMessages.some(
        (msg, idx) =>
          idx >= lastMessageCountRef.current &&
          msg.role === "assistant" &&
          msg.content !== "__TOOL_PROCESSING__"
      )

      // Update messages
      setMessages(convertedMessages)
      lastMessageCountRef.current = currentMessageCount

      // If we found a new assistant message, stop polling
      if (hasNewAssistantMessage) {
        stopPolling()
        setIsLoading(false)
        return
      }

      // Check if we've exceeded maximum polling duration (5 minutes)
      const now = Date.now()
      const startTime = pollingStartTimeRef.current
      if (startTime && now - startTime > 5 * 60 * 1000) {
        // Maximum duration reached
        stopPolling()
        setIsLoading(false)
        console.warn("Polling timeout: No assistant response received within 5 minutes")
        return
      }

      // Calculate next poll interval
      // First 30 seconds: poll every 10-15 seconds
      // After 30 seconds: poll every 2-3 seconds
      const elapsed = startTime ? now - startTime : 0
      const pollInterval = elapsed < 30000 ? 12000 : 2500 // 12s initially, 2.5s after 30s

      // Schedule next poll
      pollingTimeoutRef.current = setTimeout(pollForMessages, pollInterval)
    } catch (error) {
      console.error("Failed to poll for messages:", error)
      // Continue polling even on error (might be temporary network issue)
      const startTime = pollingStartTimeRef.current
      if (startTime) {
        const elapsed = Date.now() - startTime
        const pollInterval = elapsed < 30000 ? 12000 : 2500
        pollingTimeoutRef.current = setTimeout(pollForMessages, pollInterval)
      } else {
        stopPolling()
        setIsLoading(false)
      }
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!id) {
      console.error("Course ID is missing")
      return
    }

    // Prevent duplicate sends (while sending or polling)
    if (sendingRef.current || isLoading || isPolling) {
      return
    }

    // Stop any existing polling
    stopPolling()

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage])
    sendingRef.current = true
    setIsLoading(true)

    try {
      // Send the message to the backend (returns immediately)
      const response = await createMessage(id, content)

      // Replace optimistic message with real one from server
      const realUserMessage = convertMessageModelToMessage(response.message)
      setMessages((prev) => {
        if (realUserMessage) {
          const filtered = prev.filter((msg) => msg.id !== optimisticMessage.id)
          const updated = [...filtered, realUserMessage]
          lastMessageCountRef.current = updated.length
          return updated
        } else {
          // If conversion failed, keep optimistic message for now
          lastMessageCountRef.current = prev.length
          return prev
        }
      })

      // Start polling for assistant response
      setIsPolling(true)
      pollingStartTimeRef.current = Date.now()
      pollingTimeoutRef.current = setTimeout(pollForMessages, 12000) // First poll after 12 seconds
    } catch (error) {
      console.error("Failed to send message:", error)
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
      setIsLoading(false)
      sendingRef.current = false
    } finally {
      // Note: We don't set isLoading to false here - it will be set to false when polling stops
      sendingRef.current = false
    }
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

  const handleMainContentClick = (e: React.MouseEvent) => {
    if (!isSidebarCollapsed && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setIsSidebarCollapsed(true)
    }
  }

  return (
    <div ref={containerRef} className={`flex h-screen ${getBgColor()} overflow-hidden`} onClick={handleMainContentClick}>
      <Sidebar
        ref={sidebarRef}
        currentStep={2}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {!isChatHidden && (
        <div ref={panelsRef} className="flex flex-1">
          {isSwapped ? (
            <>
              <div className={`flex flex-col border-r ${getBorderColor()}`} style={{ width: `${100 - chatWidth}%` }}>
                <CourseOutline
                  courseId={id}
                  onToggleChat={() => setIsChatHidden(!isChatHidden)}
                  isChatHidden={isChatHidden}
                  isSwapped={isSwapped}
                  messagesCount={messages.length}
                />
              </div>

              <div className="relative group" style={{ userSelect: "none" }}>
                <div
                  className={`w-1 ${getResizerColor()} hover:bg-[#61AFEF] transition-colors h-full ${isResizing ? "bg-[#61AFEF]" : ""
                    }`}
                />
                <div onMouseDown={handleMouseDown} className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
              </div>

              <div className="flex flex-col flex-shrink-0" style={{ width: `${chatWidth}%` }}>
                <ChatSection
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading || isPolling}
                  onSwapPanels={handleSwapPanels}
                  isSwapped={isSwapped}
                  courseTitle={courseData.title}
                  onNextStep={handleNextStep}
                />
              </div>
            </>
          ) : (
            <>
              <div className={`flex flex-col border-r ${getBorderColor()}`} style={{ width: `${chatWidth}%` }}>
                <ChatSection
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading || isPolling}
                  onSwapPanels={handleSwapPanels}
                  isSwapped={isSwapped}
                  courseTitle={courseData.title}
                  onNextStep={handleNextStep}
                />
              </div>

              <div className="relative group" style={{ userSelect: "none" }}>
                <div
                  className={`w-1 ${getResizerColor()} hover:bg-[#61AFEF] transition-colors h-full ${isResizing ? "bg-[#61AFEF]" : ""
                    }`}
                />
                <div onMouseDown={handleMouseDown} className="absolute inset-y-0 -left-2 -right-2 cursor-col-resize" />
              </div>

              <div className="flex flex-col flex-shrink-0" style={{ width: `${100 - chatWidth}%` }}>
                <CourseOutline
                  courseId={id}
                  onToggleChat={() => setIsChatHidden(!isChatHidden)}
                  isChatHidden={isChatHidden}
                  isSwapped={isSwapped}
                  messagesCount={messages.length}
                />
              </div>
            </>
          )}
        </div>
      )}

      {isChatHidden && (
        <div className="flex flex-col flex-1">
          <CourseOutline
            courseId={id}
            onToggleChat={() => setIsChatHidden(!isChatHidden)}
            isChatHidden={isChatHidden}
            isSwapped={isSwapped}
            messagesCount={messages.length}
          />
        </div>
      )}
    </div>
  )
}



