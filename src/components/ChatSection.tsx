import { useState, useRef, useEffect } from "react"
import { Send, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message } from "@/types"

interface ChatSectionProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
}

export function ChatSection({ messages, onSendMessage, isLoading }: ChatSectionProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="flex flex-col h-screen bg-[#282C34]">
      {/* Header */}
      <div className="border-b border-[#3E4451] px-6 py-5">
        <h1 className="text-2xl font-semibold text-[#E0E0E0]">
          Chat your way to a course outline
        </h1>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <Bot className="w-12 h-12 mx-auto text-[#5C6370] mb-4" />
              <p className="text-[#5C6370] text-lg">
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
                    className={`rounded-lg px-4 py-3 ${message.role === "user"
                      ? "bg-[#33365D] text-[#E0E0E0] border border-[#444985] shadow-[0_4px_8px_rgba(139,92,246,0.15)]"
                      : "bg-[#1D2434] text-[#E0E0E0] border border-[#252C3C]"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#E0E0E0] uppercase">
                        {message.role === "user" ? "YOU" : "ASSISTANT"}
                      </span>
                      <span className="text-xs font-bold text-[#E0E0E0]">
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
                  <div className="bg-[#1D2434] text-[#E0E0E0] border border-[#252C3C] rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#E0E0E0] uppercase">
                        ASSISTANT
                      </span>
                      <span className="text-xs font-bold text-[#E0E0E0]">
                        {formatTime(new Date())}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#ABB2BF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-[#ABB2BF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-[#ABB2BF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
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
      <div className="border-t border-[#3E4451] bg-[#1E2025] p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center justify-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a new module, change tone, or request more detail..."
            disabled={isLoading}
            rows={2}
            className="w-[90%] rounded-xl border border-[#3E4451] bg-[#595959] px-5 py-4 text-sm text-white placeholder:text-[#B0B0B0] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 bg-[#E0E0E0] text-[#282C34] hover:bg-[#C0C0C0]"
          >
            <span className="sr-only">Send</span>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

