import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { User, LogOut, LayoutDashboard, Settings, HelpCircle, Trash2, Pencil, Check, X, Sun, Moon, Monitor } from "lucide-react"
import type { Project } from "@/types"

// Mock projects data
const mockProjects: Project[] = [
  {
    id: "project-1713175800000",
    name: "AI-Powered Course Design with React & Next.js",
    updatedAt: new Date("2024-04-15T10:30:00"),
    currentStep: "3",
  },
  {
    id: "project-1713088800000",
    name: "Introduction to Web Development",
    updatedAt: new Date("2024-04-14T15:20:00"),
    currentStep: "2",
  },
  {
    id: "project-1713002100000",
    name: "Advanced TypeScript Patterns",
    updatedAt: new Date("2024-04-13T09:15:00"),
    currentStep: "1",
  },
  {
    id: "project-1712916300000",
    name: "Full-Stack JavaScript Mastery",
    updatedAt: new Date("2024-04-12T14:45:00"),
    currentStep: "2",
  },
  {
    id: "project-1712830200000",
    name: "Machine Learning Fundamentals",
    updatedAt: new Date("2024-04-11T11:00:00"),
    currentStep: "1",
  },
  {
    id: "project-1712743800000",
    name: "UI/UX Design Principles",
    updatedAt: new Date("2024-04-10T16:30:00"),
    currentStep: "3",
  },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Determine active tab from route
  const getActiveTab = (): "dashboard" | "preferences" | "help-center" => {
    if (location.pathname === "/user/preferences") return "preferences"
    if (location.pathname === "/user/help-center") return "help-center"
    return "dashboard"
  }
  const activeTab = getActiveTab()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [username, setUsername] = useState("Guest")
  const [editedUsername, setEditedUsername] = useState("Guest")
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "dark"
  })
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null)
  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Calculate statistics
  const totalProjects = mockProjects.length
  const step1Count = mockProjects.filter((p) => p.currentStep === "1").length
  const step2Count = mockProjects.filter((p) => p.currentStep === "2").length
  const step3Count = mockProjects.filter((p) => p.currentStep === "3").length
  const step4Count = mockProjects.filter((p) => p.currentStep === "4").length

  // Group projects by step and sort by updated date (newest first)
  const step1Projects = mockProjects
    .filter((p) => p.currentStep === "1")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const step2Projects = mockProjects
    .filter((p) => p.currentStep === "2")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const step3Projects = mockProjects
    .filter((p) => p.currentStep === "3")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const step4Projects = mockProjects
    .filter((p) => p.currentStep === "4")
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  const generateUniqueProjectId = (existingProjects: Project[]): string => {
    let newId: string
    let attempts = 0
    const maxAttempts = 100

    do {
      newId = `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      attempts++
    } while (existingProjects.some((p) => p.id === newId) && attempts < maxAttempts)

    return newId
  }

  const handleCreateNewCourse = () => {
    // Generate a unique project ID that doesn't conflict with existing projects
    const newProjectId = generateUniqueProjectId(mockProjects)
    navigate(`/${newProjectId}/upload`)
  }

  const handleProjectClick = (project: Project) => {
    // Navigate based on the project's current step
    if (project.currentStep === "1") {
      navigate(`/${project.id}/upload`)
    } else if (project.currentStep === "2") {
      navigate(`/${project.id}/outline`)
    } else if (project.currentStep === "3") {
      navigate(`/${project.id}/web-design`)
    }
    // Step 4 (Deployed) projects are not clickable
  }

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu)
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    console.log("Logout clicked")
    // Add logout logic here
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmText === "DELETE") {
      console.log("Account deleted")
      // Add delete account logic here
      setShowDeleteModal(false)
      setDeleteConfirmText("")
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setDeleteConfirmText("")
  }

  const handleEditUsername = () => {
    setIsEditingUsername(true)
    setEditedUsername(username)
  }

  const handleSaveUsername = () => {
    if (editedUsername.trim()) {
      setUsername(editedUsername.trim())
    }
    setIsEditingUsername(false)
  }

  const handleCancelEditUsername = () => {
    setEditedUsername(username)
    setIsEditingUsername(false)
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  // Apply theme on mount and when theme changes
  useEffect(() => {
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", systemPrefersDark)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches)
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      // Remove dark class for light theme, add for dark theme
      if (theme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        document.documentElement.classList.add("dark")
      }
    }
  }, [theme])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  // Tooltip handlers
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, text: string) => {
    const element = e.currentTarget
    // Check if text is truncated
    const isTruncated = element.scrollWidth > element.clientWidth

    if (isTruncated) {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY }

      // Clear any existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }

      // Set timeout to show tooltip after 0.5 seconds
      tooltipTimeoutRef.current = setTimeout(() => {
        if (lastMousePositionRef.current) {
          setTooltip({
            text,
            x: lastMousePositionRef.current.x,
            y: lastMousePositionRef.current.y,
          })
        }
      }, 500)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>, text: string) => {
    const element = e.currentTarget
    const isTruncated = element.scrollWidth > element.clientWidth

    if (!isTruncated) return

    if (tooltip) {
      // Check if mouse moved significantly (more than 5px)
      const moved = lastMousePositionRef.current && (
        Math.abs(e.clientX - lastMousePositionRef.current.x) > 5 ||
        Math.abs(e.clientY - lastMousePositionRef.current.y) > 5
      )

      if (moved) {
        // Mouse moved, hide tooltip and reset position
        setTooltip(null)
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current)
          tooltipTimeoutRef.current = null
        }
        // Update position and restart timer
        lastMousePositionRef.current = { x: e.clientX, y: e.clientY }
        tooltipTimeoutRef.current = setTimeout(() => {
          if (lastMousePositionRef.current) {
            setTooltip({
              text,
              x: lastMousePositionRef.current.x,
              y: lastMousePositionRef.current.y,
            })
          }
        }, 500)
      } else {
        // Update tooltip position if mouse hasn't moved much
        setTooltip({
          text: tooltip.text,
          x: e.clientX,
          y: e.clientY,
        })
      }
    } else if (lastMousePositionRef.current) {
      // Check if mouse is still in roughly the same position
      const stillInPosition =
        Math.abs(e.clientX - lastMousePositionRef.current.x) <= 5 &&
        Math.abs(e.clientY - lastMousePositionRef.current.y) <= 5

      if (!stillInPosition) {
        // Mouse moved away, update position and restart timer
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current)
        }
        lastMousePositionRef.current = { x: e.clientX, y: e.clientY }
        tooltipTimeoutRef.current = setTimeout(() => {
          if (lastMousePositionRef.current) {
            setTooltip({
              text,
              x: lastMousePositionRef.current.x,
              y: lastMousePositionRef.current.y,
            })
          }
        }, 500)
      }
    }
  }

  const handleMouseLeave = () => {
    setTooltip(null)
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
    lastMousePositionRef.current = null
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current)
      }
    }
  }, [])

  const getStepColor = (step: string) => {
    switch (step) {
      case "Step 1: Upload":
        return "#61AFEF"
      case "Step 2: Outline":
        return "#E5C07B"
      case "Step 3: Design":
        return "#56B6C2"
      case "Step 4: Deployed":
        return "#8DB472"
      default:
        return "#9DA5B4"
    }
  }

  const renderProjectSection = (title: string, projects: Project[]) => {
    if (projects.length === 0) return null

    const stepColor = getStepColor(title)
    const isDeployed = title === "Step 4: Deployed"

    return (
      <div>
        <h3 className="text-sm font-semibold text-[#E0E0E0] mb-3 flex items-center gap-2 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stepColor }} />
          {title}
        </h3>
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => !isDeployed && handleProjectClick(project)}
              className={`flex items-center justify-between rounded-xl border border-[#3E4451] bg-[#282C34] px-4 py-3 transition-colors ${isDeployed
                ? ""
                : "hover:bg-[#2C313C] cursor-pointer"
                }`}
            >
              <span
                className="text-sm font-medium text-[#E0E0E0] truncate min-w-0 flex-1"
                onMouseEnter={(e) => handleMouseEnter(e, project.name)}
                onMouseMove={(e) => handleMouseMove(e, project.name)}
                onMouseLeave={handleMouseLeave}
              >{project.name}</span>
              <span className="text-xs text-[#9DA5B4] whitespace-nowrap ml-2 flex-shrink-0">{formatDate(project.updatedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#21252B] text-[#E0E0E0] overflow-hidden">
      {/* Header */}
      <header className="border-b border-[#3E4451] px-8 py-6 flex-shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#E0E0E0]">User profile</h1>
          </div>
          <div ref={userMenuRef} className="relative">
            <button
              onClick={handleUserClick}
              className="flex items-center gap-3 hover:bg-[#282C34] rounded-lg px-4 py-3 transition-colors cursor-pointer"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#282C34] flex items-center justify-center border border-[#3E4451] flex-shrink-0">
                <User className="w-5 h-5 text-[#E0E0E0]" />
              </div>
              <span className="text-sm text-[#E0E0E0] font-medium">{username}</span>
            </button>

            {/* User Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2">
                <div className="bg-[#282C34] border border-[#3E4451] rounded-md shadow-lg overflow-hidden flex flex-col gap-0 min-w-[160px]">
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#3E4451] transition-colors text-sm text-red-400 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area with Side Panel */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-full">
            {/* Left Panel - No box, no border */}
            <div className="w-64 flex flex-col gap-1 p-2 pt-10">
              <button
                onClick={() => navigate("/user/dashboard")}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "dashboard"
                  ? "bg-[#282C34] text-[#E0E0E0]"
                  : "text-[#9DA5B4] hover:bg-[#282C34] hover:text-[#E0E0E0]"
                  }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className={`text-sm ${activeTab === "dashboard" ? "font-semibold" : "font-medium"}`}>Dashboard</span>
              </button>
              <button
                onClick={() => navigate("/user/preferences")}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "preferences"
                  ? "bg-[#282C34] text-[#E0E0E0]"
                  : "text-[#9DA5B4] hover:bg-[#282C34] hover:text-[#E0E0E0]"
                  }`}
              >
                <Settings className="w-5 h-5" />
                <span className={`text-sm ${activeTab === "preferences" ? "font-semibold" : "font-medium"}`}>Preferences</span>
              </button>
              <button
                onClick={() => navigate("/user/help-center")}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "help-center"
                  ? "bg-[#282C34] text-[#E0E0E0]"
                  : "text-[#9DA5B4] hover:bg-[#282C34] hover:text-[#E0E0E0]"
                  }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className={`text-sm ${activeTab === "help-center" ? "font-semibold" : "font-medium"}`}>Help Center</span>
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1">
              <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-10">
                {activeTab === "dashboard" && (
                  <>
                    {/* User Card */}
                    <section className="rounded-2xl border border-[#3E4451] bg-[#1E2025] p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 rounded-full bg-[#282C34] flex items-center justify-center border border-[#3E4451] flex-shrink-0">
                            <User className="w-8 h-8 text-[#E0E0E0]" />
                          </div>
                          <div className="flex-1">
                            {isEditingUsername ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editedUsername}
                                  onChange={(e) => setEditedUsername(e.target.value)}
                                  className="flex-1 px-3 py-1 rounded-md bg-[#282C34] border border-[#3E4451] text-[#E0E0E0] text-xl font-semibold focus:outline-none focus:border-[#61AFEF]"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveUsername()
                                    } else if (e.key === "Escape") {
                                      handleCancelEditUsername()
                                    }
                                  }}
                                />
                                <button
                                  onClick={handleSaveUsername}
                                  className="p-1 rounded hover:bg-[#282C34] transition-colors cursor-pointer"
                                  aria-label="Save username"
                                >
                                  <Check className="w-5 h-5 text-[#8DB472]" />
                                </button>
                                <button
                                  onClick={handleCancelEditUsername}
                                  className="p-1 rounded hover:bg-[#282C34] transition-colors cursor-pointer"
                                  aria-label="Cancel edit"
                                >
                                  <X className="w-5 h-5 text-[#9DA5B4]" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold text-[#E0E0E0] whitespace-nowrap">{username}</h2>
                                <button
                                  onClick={handleEditUsername}
                                  className="p-1 rounded hover:bg-[#282C34] transition-colors cursor-pointer"
                                  aria-label="Edit username"
                                >
                                  <Pencil className="w-4 h-4 text-[#9DA5B4]" />
                                </button>
                              </div>
                            )}
                            <p className="text-sm text-[#9DA5B4] whitespace-nowrap">User Account</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-900/50 text-red-400 text-sm font-medium transition hover:bg-red-900/70 border border-red-800/50 cursor-pointer whitespace-nowrap"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </section>

                    {/* Statistics Section */}
                    <section className="flex flex-wrap gap-6">
                      <div className="rounded-2xl border-2 border-[#C678DD] bg-[#1E2025] p-6 w-full md:w-full xl:w-auto xl:flex-1 xl:min-w-0 overflow-hidden">
                        <p
                          className="text-sm text-[#9DA5B4] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, "Total Projects")}
                          onMouseMove={(e) => handleMouseMove(e, "Total Projects")}
                          onMouseLeave={handleMouseLeave}
                        >Total Projects</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#C678DD] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, totalProjects.toString())}
                          onMouseMove={(e) => handleMouseMove(e, totalProjects.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{totalProjects}</p>
                      </div>
                      <div className="w-px bg-[#3E4451] self-stretch hidden xl:block" />
                      <div className="rounded-2xl border-2 border-[#61AFEF] bg-[#1E2025] p-6 flex-1 min-w-[calc(50%-12px)] md:flex-1 md:min-w-0 xl:flex-1 xl:min-w-0 overflow-hidden">
                        <p
                          className="text-sm text-[#9DA5B4] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, "Step 1: Upload")}
                          onMouseMove={(e) => handleMouseMove(e, "Step 1: Upload")}
                          onMouseLeave={handleMouseLeave}
                        >Step 1: Upload</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#61AFEF] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, step1Count.toString())}
                          onMouseMove={(e) => handleMouseMove(e, step1Count.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{step1Count}</p>
                      </div>
                      <div className="rounded-2xl border-2 border-[#E5C07B] bg-[#1E2025] p-6 flex-1 min-w-[calc(50%-12px)] md:flex-1 md:min-w-0 xl:flex-1 xl:min-w-0 overflow-hidden">
                        <p
                          className="text-sm text-[#9DA5B4] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, "Step 2: Outline")}
                          onMouseMove={(e) => handleMouseMove(e, "Step 2: Outline")}
                          onMouseLeave={handleMouseLeave}
                        >Step 2: Outline</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#E5C07B] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, step2Count.toString())}
                          onMouseMove={(e) => handleMouseMove(e, step2Count.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{step2Count}</p>
                      </div>
                      <div className="rounded-2xl border-2 border-[#56B6C2] bg-[#1E2025] p-6 flex-1 min-w-[calc(50%-12px)] md:flex-1 md:min-w-0 xl:flex-1 xl:min-w-0 overflow-hidden">
                        <p
                          className="text-sm text-[#9DA5B4] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, "Step 3: Design")}
                          onMouseMove={(e) => handleMouseMove(e, "Step 3: Design")}
                          onMouseLeave={handleMouseLeave}
                        >Step 3: Design</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#56B6C2] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, step3Count.toString())}
                          onMouseMove={(e) => handleMouseMove(e, step3Count.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{step3Count}</p>
                      </div>
                      <div className="rounded-2xl border-2 border-[#8DB472] bg-[#1E2025] p-6 flex-1 min-w-[calc(50%-12px)] md:flex-1 md:min-w-0 xl:flex-1 xl:min-w-0 overflow-hidden">
                        <p
                          className="text-sm text-[#9DA5B4] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, "Step 4: Deployed")}
                          onMouseMove={(e) => handleMouseMove(e, "Step 4: Deployed")}
                          onMouseLeave={handleMouseLeave}
                        >Step 4: Deployed</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#8DB472] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, step4Count.toString())}
                          onMouseMove={(e) => handleMouseMove(e, step4Count.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{step4Count}</p>
                      </div>
                    </section>

                    {/* Projects List Section */}
                    <section className="rounded-2xl border border-[#3E4451] bg-[#1E2025] p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-[#E0E0E0] whitespace-nowrap">Current Projects</h2>
                        <button
                          onClick={handleCreateNewCourse}
                          className="rounded-md bg-[#61AFEF] px-4 py-2 text-sm font-medium text-[#1E2025] transition hover:bg-[#82C6FF] whitespace-nowrap"
                        >
                          Create New Course
                        </button>
                      </div>
                      <div className="space-y-6">
                        {renderProjectSection("Step 1: Upload", step1Projects)}
                        {step1Projects.length > 0 && (step2Projects.length > 0 || step3Projects.length > 0 || step4Projects.length > 0) && (
                          <div className="border-t border-[#3E4451]" />
                        )}
                        {renderProjectSection("Step 2: Outline", step2Projects)}
                        {step2Projects.length > 0 && (step3Projects.length > 0 || step4Projects.length > 0) && (
                          <div className="border-t border-[#3E4451]" />
                        )}
                        {renderProjectSection("Step 3: Design", step3Projects)}
                        {step3Projects.length > 0 && step4Projects.length > 0 && (
                          <div className="border-t border-[#3E4451]" />
                        )}
                        {renderProjectSection("Step 4: Deployed", step4Projects)}
                      </div>
                    </section>
                  </>
                )}

                {activeTab === "preferences" && (
                  <div>
                    <h2 className="text-lg font-semibold text-[#E0E0E0] mb-6">Preferences</h2>
                    <section className="rounded-2xl border border-[#3E4451] bg-[#1E2025] p-6 w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-5 h-5 text-[#E0E0E0]" />
                        <h3 className="text-base font-semibold text-[#E0E0E0]">Theme</h3>
                      </div>
                      <p className="text-sm text-[#9DA5B4] mb-4">Choose your preferred color scheme</p>
                      <div className="relative flex p-1 rounded-lg bg-[#282C34] border border-[#3E4451]">
                        {/* Sliding indicator */}
                        <div
                          className={`absolute top-1 bottom-1 rounded-md bg-[#1E2025] border border-[#5C6370] transition-all duration-300 ease-in-out ${theme === "light"
                            ? "left-1 w-[calc(33.333%-0.333rem)]"
                            : theme === "dark"
                              ? "left-[calc(33.333%+0.167rem)] w-[calc(33.333%-0.333rem)]"
                              : "left-[calc(66.666%+0.333rem-0.25rem)] w-[calc(33.333%-0.333rem)]"
                            }`}
                        />
                        <button
                          onClick={() => handleThemeChange("light")}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors cursor-pointer flex-1 z-10 ${theme === "light"
                            ? "text-[#E0E0E0]"
                            : "text-[#9DA5B4] hover:text-[#E0E0E0]"
                            }`}
                        >
                          <Sun className="w-4 h-4" />
                          <span className="text-sm font-medium">Light</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors cursor-pointer flex-1 z-10 ${theme === "dark"
                            ? "text-[#E0E0E0]"
                            : "text-[#9DA5B4] hover:text-[#E0E0E0]"
                            }`}
                        >
                          <Moon className="w-4 h-4" />
                          <span className="text-sm font-medium">Dark</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("system")}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors cursor-pointer flex-1 z-10 ${theme === "system"
                            ? "text-[#E0E0E0]"
                            : "text-[#9DA5B4] hover:text-[#E0E0E0]"
                            }`}
                        >
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm font-medium">System</span>
                        </button>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === "help-center" && (
                  <div>
                    <h2 className="text-lg font-semibold text-[#E0E0E0] mb-6">Help Center</h2>
                    <section className="rounded-2xl border border-[#3E4451] bg-[#1E2025] p-6 w-full">
                      <p className="text-sm text-[#9DA5B4]">Help content will be displayed here.</p>
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-md bg-[#282C34] border border-[#3E4451] text-sm text-[#E0E0E0] shadow-lg pointer-events-none"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`,
            maxWidth: '300px',
            wordWrap: 'break-word',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleDeleteCancel}
        >
          <div
            className="bg-[#282C34] border border-[#3E4451] rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-[#E0E0E0] mb-4">Delete Account</h2>
            <div className="text-sm text-[#ABB2BF] mb-6 space-y-2">
              <p>Are you sure you want to permanently delete your account?</p>
              <p>
                This action <span className="font-bold text-[#E0E0E0]">CANNOT be undone</span> and all your data will be permanently deleted.
              </p>
              <p className="mt-4">Type DELETE to confirm.</p>
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2 rounded-md bg-[#1E2025] border border-[#3E4451] text-[#E0E0E0] mb-6 focus:outline-none focus:border-[#61AFEF]"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 rounded-md border border-[#3E4451] bg-[#1E2025] text-[#E0E0E0] text-sm font-medium transition hover:bg-[#282C34] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText !== "DELETE"}
                className="px-4 py-2 rounded-md bg-red-900/50 text-red-400 text-sm font-medium transition hover:bg-red-900/70 border border-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

