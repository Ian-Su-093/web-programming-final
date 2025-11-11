import { useState } from "react"
import { ChatSection } from "@/components/ChatSection"
import { CourseOutline } from "@/components/CourseOutline"
import type { Message, CourseData } from "@/types"
import "./App.css"

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

function App() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [courseData, setCourseData] = useState<CourseData>(mockCourseData)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand you'd like to plan a course. This is a demo response. In a real implementation, this would connect to an AI service to generate course outlines based on your input.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)

      // Example: Update course outline based on conversation
      // In a real app, this would parse the AI response and extract course structure
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
                "Map conversational UX flows"
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
                "Instrument chat state management patterns"
              ],
            },
          ],
        })
      }
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-[#21252B] overflow-hidden">
      {/* Chat Section - Left Side */}
      <div className="flex-1 flex flex-col border-r border-[#3E4451]">
        <ChatSection
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Course Outline Section - Right Side */}
      <div className="w-96 flex-shrink-0">
        <CourseOutline courseData={courseData} />
      </div>
    </div>
  )
}

export default App
