import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { MouseEvent as ReactMouseEvent } from "react"
import "@/App.css"
import { ChatSection } from "@/components/ChatSection"
import { WebPreview } from "@/components/WebPreview"
import { Sidebar } from "@/components/Sidebar"
import { Modal } from "@/components/ui/modal"
import type { Message } from "@/types"
import { getCourseById, getMessagesByCourseId, convertMessageModelToMessage } from "@/lib/api"

export function WebDesignPage() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [courseTitle, setCourseTitle] = useState<string>("")
  const [chatWidth, setChatWidth] = useState(66.67)
  const [isResizing, setIsResizing] = useState(false)
  const [isChatHidden, setIsChatHidden] = useState(false)
  const [isPreviewHidden, setIsPreviewHidden] = useState(false)
  const [isSwapped, setIsSwapped] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [stepToNavigate, setStepToNavigate] = useState<1 | 2 | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelsRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Fetch course data and messages on mount
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) {
        return
      }

      try {
        const response = await getCourseById(id)
        setCourseTitle(response.course.name)
      } catch (error) {
        console.error("Failed to fetch course data:", error)
        // Keep empty title on error
      }
    }

    const fetchMessages = async () => {
      if (!id) {
        return
      }

      try {
        const response = await getMessagesByCourseId(id)
        console.log("Received chat history (raw):", response)
        console.log("Raw messages array:", response.messages)

        // Convert MessageModel[] to Message[]
        // Filter out null values (messages with null content)
        const convertedMessages = response.messages
          .map(convertMessageModelToMessage)
          .filter((msg): msg is Message => msg !== null)

        console.log("Converted chat history:", convertedMessages)
        setMessages(convertedMessages)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        // Keep empty messages on error
      }
    }

    fetchCourseData()
    fetchMessages()
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

  const handleStepSelect = (step: 1 | 2 | 3) => {
    if (step === 1) {
      setStepToNavigate(1)
      setShowConfirmModal(true)
    } else if (step === 2) {
      setStepToNavigate(2)
      setShowConfirmModal(true)
    }
    // Step 3 is current, no action needed
  }

  const handleConfirm = () => {
    setShowConfirmModal(false)
    if (stepToNavigate === 1) {
      id && navigate(`/${id}/upload`)
    } else if (stepToNavigate === 2) {
      id && navigate(`/${id}/outline`)
    }
    setStepToNavigate(null)
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setStepToNavigate(null)
  }

  const getModalMessage = () => {
    if (stepToNavigate === 1) {
      return t("outline.webDesign.modal.uploadToOutline")
    } else if (stepToNavigate === 2) {
      return t("outline.webDesign.modal.outlineToLayout")
    }
    return t("outline.modal.message")
  }

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

  const handleMainContentClick = (e: React.MouseEvent) => {
    if (!isSidebarCollapsed && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setIsSidebarCollapsed(true)
    }
  }

  return (
    <div ref={containerRef} className={`flex h-screen ${getBgColor()} overflow-hidden`} onClick={handleMainContentClick}>
      <Sidebar
        ref={sidebarRef}
        currentStep={3}
        onStepSelect={handleStepSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        message={getModalMessage()}
        confirmText={t("outline.webDesign.modal.continue")}
        cancelText={t("outline.webDesign.modal.cancel")}
      />

      {!isChatHidden && !isPreviewHidden && (
        <div ref={panelsRef} className="flex flex-1">
          {isSwapped ? (
            <>
              <div className={`flex flex-col border-r ${getBorderColor()}`} style={{ width: `${100 - chatWidth}%` }}>
                <WebPreview
                  onToggleChat={() => setIsChatHidden(!isChatHidden)}
                  onHidePreview={() => setIsPreviewHidden(true)}
                  onShowChat={() => setIsChatHidden(false)}
                  isChatHidden={isChatHidden}
                  isSwapped={isSwapped}
                  id={id}
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
                  isLoading={isLoading}
                  onSwapPanels={handleSwapPanels}
                  onShowPreview={() => setIsPreviewHidden(false)}
                  isSwapped={isSwapped}
                  isPreviewHidden={isPreviewHidden}
                  courseTitle={courseTitle}
                />
              </div>
            </>
          ) : (
            <>
              <div className={`flex flex-col border-r ${getBorderColor()}`} style={{ width: `${chatWidth}%` }}>
                <ChatSection
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onSwapPanels={handleSwapPanels}
                  onShowPreview={() => setIsPreviewHidden(false)}
                  isSwapped={isSwapped}
                  isPreviewHidden={isPreviewHidden}
                  courseTitle={courseTitle}
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
                <WebPreview
                  onToggleChat={() => setIsChatHidden(!isChatHidden)}
                  onHidePreview={() => setIsPreviewHidden(true)}
                  onShowChat={() => setIsChatHidden(false)}
                  isChatHidden={isChatHidden}
                  isSwapped={isSwapped}
                  id={id}
                />
              </div>
            </>
          )}
        </div>
      )}

      {isChatHidden && !isPreviewHidden && (
        <div className="flex flex-col flex-1">
          <WebPreview
            onToggleChat={() => setIsChatHidden(!isChatHidden)}
            onHidePreview={() => setIsPreviewHidden(true)}
            onShowChat={() => setIsChatHidden(false)}
            isChatHidden={isChatHidden}
            isSwapped={isSwapped}
            id={id}
          />
        </div>
      )}

      {!isChatHidden && isPreviewHidden && (
        <div className="flex flex-col flex-1">
          <ChatSection
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSwapPanels={handleSwapPanels}
            onShowPreview={() => setIsPreviewHidden(false)}
            isSwapped={isSwapped}
            isPreviewHidden={isPreviewHidden}
            courseTitle={courseTitle}
          />
        </div>
      )}
    </div>
  )
}

