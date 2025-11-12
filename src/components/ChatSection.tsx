import { useState, useRef, useEffect } from "react"
import { Send, Bot, ArrowLeftRight, Paperclip, PanelRightOpen, PanelLeftOpen, Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message } from "@/types"

interface ChatSectionProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
  onSwapPanels?: () => void
  onShowPreview?: () => void
  isSwapped?: boolean
  isPreviewHidden?: boolean
  courseTitle?: string
  onCourseTitleChange?: (title: string) => void
  isEditable?: boolean
}

export function ChatSection({ messages, onSendMessage, isLoading, onSwapPanels, onShowPreview, isSwapped = false, isPreviewHidden = false, courseTitle, onCourseTitleChange, isEditable = false }: ChatSectionProps) {
  const [input, setInput] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(courseTitle || "Chat your way to a course outline")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  
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
    return "bg-[#282C34]"
  }

  const getBorderColor = () => {
    if (theme === "light") return "border-gray-200"
    return "border-[#3E4451]"
  }

  const getTextColor = () => {
    if (theme === "light") return "text-gray-800"
    return "text-[#E0E0E0]"
  }

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#5C6370]"
  }

  const getHoverBg = () => {
    if (theme === "light") return "hover:bg-gray-100"
    return "hover:bg-[#3E4451]"
  }

  const getInputBg = () => {
    if (theme === "light") return "bg-white"
    return "bg-[#505050]"
  }

  const getInputBorder = () => {
    if (theme === "light") return "border-gray-300"
    return "border-[#3E4451]"
  }

  const getInputText = () => {
    if (theme === "light") return "text-gray-900"
    return "text-white"
  }

  const getInputPlaceholder = () => {
    if (theme === "light") return "placeholder:text-gray-400"
    return "placeholder:text-[#B0B0B0]"
  }

  const getInputAreaBg = () => {
    if (theme === "light") return "bg-white"
    return "bg-[#1E2025]"
  }

  useEffect(() => {
    setEditedTitle(courseTitle || "Chat your way to a course outline")
  }, [courseTitle])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      // Dummy function for file upload
      console.log("PDF file uploaded:", file.name)
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } else if (file) {
      alert("Please upload a PDF file only.")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handlePaperclipClick = () => {
    fileInputRef.current?.click()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const handleEditTitle = () => {
    setIsEditingTitle(true)
    setTimeout(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }, 0)
  }

  const handleSaveTitle = () => {
    if (onCourseTitleChange && editedTitle.trim()) {
      onCourseTitleChange(editedTitle.trim())
    }
    setIsEditingTitle(false)
  }

  const handleCancelEdit = () => {
    setEditedTitle(courseTitle || "Chat your way to a course outline")
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTitle()
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  const displayTitle = courseTitle || "Chat your way to a course outline"

  return (
    <div className={`flex flex-col h-screen ${getBgColor()}`}>
      {/* Header */}
      <div className={`border-b ${getBorderColor()} px-6 py-5 flex items-center gap-3`}>
        {isSwapped && onSwapPanels && !isPreviewHidden && (
          <button
            onClick={onSwapPanels}
            className={`p-2 ${getHoverBg()} rounded-md transition-colors cursor-pointer`}
            aria-label="Swap panels"
          >
            <ArrowLeftRight className={`w-5 h-5 ${getMutedText()}`} />
          </button>
        )}
        {isSwapped && isPreviewHidden && onShowPreview && (
          <button
            onClick={onShowPreview}
            className={`p-2 ${getHoverBg()} rounded-md transition-colors cursor-pointer`}
            aria-label="Show preview"
            title="Show preview"
          >
            <PanelLeftOpen className={`w-5 h-5 ${getMutedText()}`} />
          </button>
        )}
        <div className="flex items-center gap-2 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleSaveTitle}
                className={`text-2xl font-semibold ${getTextColor()} bg-transparent border-b-2 border-[#61AFEF] focus:outline-none flex-1`}
              />
              <button
                onClick={handleSaveTitle}
                className={`p-1 ${getHoverBg()} rounded transition-colors cursor-pointer`}
                aria-label="Save title"
                title="Save title"
              >
                <Check className="w-4 h-4 text-[#8DB472]" />
              </button>
              <button
                onClick={handleCancelEdit}
                className={`p-1 ${getHoverBg()} rounded transition-colors cursor-pointer`}
                aria-label="Cancel edit"
                title="Cancel edit"
              >
                <X className="w-4 h-4 text-[#E06C75]" />
              </button>
            </div>
          ) : (
            <>
              <h1 className={`text-2xl font-semibold ${getTextColor()}`}>
                {displayTitle}
              </h1>
              {isEditable && onCourseTitleChange && (
                <button
                  onClick={handleEditTitle}
                  className={`p-1 ${getHoverBg()} rounded transition-colors cursor-pointer`}
                  aria-label="Edit course title"
                  title="Edit course title"
                >
                  <Pencil className={`w-4 h-4 ${getMutedText()}`} />
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {!isSwapped && isPreviewHidden && onShowPreview && (
            <button
              onClick={onShowPreview}
              className={`p-2 ${getHoverBg()} rounded-md transition-colors cursor-pointer`}
              aria-label="Show preview"
              title="Show preview"
            >
              <PanelRightOpen className={`w-5 h-5 ${getMutedText()}`} />
            </button>
          )}
          {!isSwapped && onSwapPanels && !isPreviewHidden && (
            <button
              onClick={onSwapPanels}
              className={`p-2 ${getHoverBg()} rounded-md transition-colors cursor-pointer`}
              aria-label="Swap panels"
            >
              <ArrowLeftRight className={`w-5 h-5 ${getMutedText()}`} />
            </button>
          )}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Bot className={`w-12 h-12 mx-auto ${getMutedText()} mb-4`} />
              <p className={`${getMutedText()} text-lg`}>
                Start a conversation to plan your course
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-2 ${message.role === "user" ? "items-end" : "items-start"
                  }`}
              >
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-lg px-4 py-3 border ${
                      message.role === "user"
                        ? theme === "light"
                          ? "bg-blue-100 text-gray-800 border-blue-200 shadow-[0_4px_8px_rgba(59,130,246,0.15)]"
                          : "bg-[#33365D] text-[#E0E0E0] border-[#444985] shadow-[0_4px_8px_rgba(139,92,246,0.15)]"
                        : theme === "light"
                        ? "bg-gray-100 text-gray-800 border-gray-200"
                        : "bg-[#1D2434] text-[#E0E0E0] border-[#252C3C]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${theme === "light" ? "text-gray-800" : "text-[#E0E0E0]"} uppercase`}>
                        {message.role === "user" ? "YOU" : "ASSISTANT"}
                      </span>
                      <span className={`text-xs font-bold ${theme === "light" ? "text-gray-800" : "text-[#E0E0E0]"}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col gap-2 items-start">
                <div className="max-w-[85%]">
                  <div className={`${theme === "light" ? "bg-gray-100 text-gray-800 border-gray-200" : "bg-[#1D2434] text-[#E0E0E0] border-[#252C3C]"} border rounded-lg px-4 py-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${theme === "light" ? "text-gray-800" : "text-[#E0E0E0]"} uppercase`}>
                        ASSISTANT
                      </span>
                      <span className={`text-xs font-bold ${theme === "light" ? "text-gray-800" : "text-[#E0E0E0]"}`}>
                        {formatTime(new Date())}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className={`w-2 h-2 ${theme === "light" ? "bg-gray-500" : "bg-[#ABB2BF]"} rounded-full animate-bounce`} style={{ animationDelay: "0ms" }}></span>
                      <span className={`w-2 h-2 ${theme === "light" ? "bg-gray-500" : "bg-[#ABB2BF]"} rounded-full animate-bounce`} style={{ animationDelay: "150ms" }}></span>
                      <span className={`w-2 h-2 ${theme === "light" ? "bg-gray-500" : "bg-[#ABB2BF]"} rounded-full animate-bounce`} style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Box */}
      <div className={`border-t ${getBorderColor()} ${getInputAreaBg()} p-4`}>
        <form onSubmit={handleSubmit} className="flex gap-4 items-center justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
          />
          <div className="relative w-[80%] flex items-center">
            <button
              type="button"
              onClick={handlePaperclipClick}
              className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-[#3E4451]/50"} rounded-md transition-colors z-10 cursor-pointer`}
              aria-label="Upload PDF file"
            >
              <Paperclip className={`w-5 h-5 ${getMutedText()}`} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a new module, change tone, or request more detail..."
              disabled={isLoading}
              rows={1}
              className={`w-full rounded-xl border ${getInputBorder()} ${getInputBg()} pl-14 pr-5 py-4 text-sm ${getInputText()} ${getInputPlaceholder()} focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none`}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-4 ${theme === "light" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-[#E0E0E0] text-[#282C34] hover:bg-[#C0C0C0]"}`}
          >
            <span className="sr-only">Send</span>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

