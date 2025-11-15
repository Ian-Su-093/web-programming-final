import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { User, LogOut, LayoutDashboard, Settings, HelpCircle, Trash2, Pencil, Check, X, Sun, Moon, Monitor, Languages } from "lucide-react"
import type { Project } from "@/types"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n/config"

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
  const { t } = useTranslation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Determine active tab from route
  const getActiveTab = (): "dashboard" | "preferences" | "help-center" => {
    if (location.pathname === "/user/preferences") return "preferences"
    if (location.pathname === "/user/help-center") return "help-center"
    return "dashboard"
  }
  const activeTab = getActiveTab()

  // Get header title based on active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "preferences":
        return t("dashboard.preferences")
      case "help-center":
        return t("dashboard.helpCenter")
      case "dashboard":
      default:
        return t("dashboard.title")
    }
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [username, setUsername] = useState("Guest")
  const [editedUsername, setEditedUsername] = useState("Guest")
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "dark"
  })
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem("language") || "en"
  })
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastMousePositionRef = useRef<{ x: number; y: number } | null>(null)
  const mouseMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Calculate statistics
  const totalProjects = mockProjects.filter((p) => p.currentStep !== "1").length
  const step2Count = mockProjects.filter((p) => p.currentStep === "2").length
  const step3Count = mockProjects.filter((p) => p.currentStep === "3").length
  const step4Count = mockProjects.filter((p) => p.currentStep === "4").length

  // Group projects by step and sort by updated date (newest first)
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
    if (project.currentStep === "2") {
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
    // Redirect to login page
    navigate("/login")
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

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang)
    i18n.changeLanguage(lang)
    localStorage.setItem("language", lang)
    setShowLanguageDropdown(false)
  }

  // Sync language state with i18n on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en"
    setCurrentLanguage(savedLanguage)
    i18n.changeLanguage(savedLanguage)
  }, [])

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false)
      }
    }

    if (showLanguageDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showLanguageDropdown])

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  // Apply theme on mount and when theme changes
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove("dark", "theme-light")

    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", systemPrefersDark)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        // Remove other theme classes when system preference changes
        document.documentElement.classList.remove("theme-light")
        document.documentElement.classList.toggle("dark", e.matches)
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else if (theme === "light") {
      document.documentElement.classList.add("theme-light")
    } else {
      // dark theme
      document.documentElement.classList.add("dark")
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

  // Theme-aware color helpers
  const getBgColor = () => {
    if (theme === "light") return "bg-white"
    return "bg-[#21252B]"
  }

  const getTextColor = () => {
    if (theme === "light") return "text-gray-800"
    return "text-[#E0E0E0]"
  }

  const getBorderColor = () => {
    if (theme === "light") return "border-gray-200"
    return "border-[#3E4451]"
  }

  const getCardBg = () => {
    if (theme === "light") return "bg-gray-50"
    return "bg-[#1E2025]"
  }

  const getCardSurface = () => {
    if (theme === "light") return "bg-gray-100"
    return "bg-[#282C34]"
  }

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#9DA5B4]"
  }

  const getHoverBg = () => {
    if (theme === "light") return "hover:bg-gray-100"
    return "hover:bg-[#282C34]"
  }

  const getStepColor = (step: string) => {
    // Compare with translated strings
    if (step === t("dashboard.statistics.outlineStage") || step === "Outline stage") {
      return "#E5C07B"
    }
    if (step === t("dashboard.statistics.designStage") || step === "Design stage") {
      return "#56B6C2"
    }
    if (step === t("dashboard.statistics.deployed") || step === "Deployed") {
      return "#8DB472"
    }
    return "#9DA5B4"
  }

  const renderProjectSection = (title: string, projects: Project[]) => {
    if (projects.length === 0) return null

    const stepColor = getStepColor(title)
    const isDeployed = title === t("dashboard.statistics.deployed") || title === "Deployed"

    return (
      <div>
        <h3 className={`text-sm font-semibold ${getTextColor()} mb-3 flex items-center gap-2 whitespace-nowrap`}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stepColor }} />
          {title}
        </h3>
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => !isDeployed && handleProjectClick(project)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 ${isDeployed
                ? `${getBorderColor()} ${getCardSurface()}`
                : `${getBorderColor()} ${getCardSurface()} cursor-pointer ${theme === "light" ? "hover:border-blue-400 hover:bg-blue-50" : "hover:border-[#61AFEF] hover:bg-[#2C313C]"}`
                }`}
            >
              <span
                className={`text-sm font-medium ${getTextColor()} truncate min-w-0 flex-1`}
                onMouseEnter={(e) => handleMouseEnter(e, project.name)}
                onMouseMove={(e) => handleMouseMove(e, project.name)}
                onMouseLeave={handleMouseLeave}
              >{project.name}</span>
              <span className={`text-xs ${getMutedText()} whitespace-nowrap ml-2 flex-shrink-0`}>{formatDate(project.updatedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-screen ${getBgColor()} ${getTextColor()} overflow-hidden`}>
      {/* Header */}
      <header className={`border-b ${getBorderColor()} px-8 py-6 flex-shrink-0`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className={`text-3xl font-semibold ${getTextColor()}`}>{getHeaderTitle()}</h1>
          </div>
          <div ref={userMenuRef} className="relative">
            <button
              onClick={handleUserClick}
              className={`flex items-center gap-3 ${getHoverBg()} rounded-lg px-4 py-3 transition-colors cursor-pointer`}
              aria-label="User menu"
            >
              <div className={`w-8 h-8 rounded-full ${getCardSurface()} flex items-center justify-center border ${getBorderColor()} flex-shrink-0`}>
                <User className={`w-5 h-5 ${getTextColor()}`} />
              </div>
              <span className={`text-sm ${getTextColor()} font-medium`}>{username}</span>
            </button>

            {/* User Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2">
                <div className={`${getCardSurface()} border ${getBorderColor()} rounded-md shadow-lg overflow-hidden flex flex-col gap-0 min-w-[160px]`}>
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2 ${getHoverBg()} transition-colors text-sm text-red-400 cursor-pointer`}
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>{t("dashboard.logout")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area with Side Panel */}
      <main className="flex-1 overflow-auto" style={{ scrollbarGutter: 'stable' }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex h-full">
            {/* Left Panel - No box, no border */}
            <div className="w-64 flex flex-col gap-1 p-2 pt-10">
              <button
                onClick={() => navigate("/user/dashboard")}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "dashboard"
                  ? `${getCardSurface()} ${getTextColor()}`
                  : `${getMutedText()} ${getHoverBg()}`
                  }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className={`text-sm ${activeTab === "dashboard" ? "font-semibold" : "font-medium"}`}>{t("dashboard.title")}</span>
              </button>
              <button
                onClick={() => navigate("/user/preferences")}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "preferences"
                  ? `${getCardSurface()} ${getTextColor()}`
                  : `${getMutedText()} ${getHoverBg()}`
                  }`}
              >
                <Settings className="w-5 h-5" />
                <span className={`text-sm ${activeTab === "preferences" ? "font-semibold" : "font-medium"}`}>{t("dashboard.preferences")}</span>
              </button>
              <button
                onClick={() => navigate("/user/help-center")}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${activeTab === "help-center"
                  ? `${getCardSurface()} ${getTextColor()}`
                  : `${getMutedText()} ${getHoverBg()}`
                  }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className={`text-sm ${activeTab === "help-center" ? "font-semibold" : "font-medium"}`}>{t("dashboard.helpCenter")}</span>
              </button>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1">
              <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-10">
                {activeTab === "dashboard" && (
                  <>
                    {/* User Card */}
                    <section className={`rounded-2xl border ${getBorderColor()} ${getCardBg()} p-6`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-16 h-16 rounded-full ${getCardSurface()} flex items-center justify-center border ${getBorderColor()} flex-shrink-0`}>
                            <User className={`w-8 h-8 ${getTextColor()}`} />
                          </div>
                          <div className="flex-1">
                            {isEditingUsername ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editedUsername}
                                  onChange={(e) => setEditedUsername(e.target.value)}
                                  className={`flex-1 px-3 py-1 rounded-md ${getCardSurface()} border ${getBorderColor()} ${getTextColor()} text-xl font-semibold focus:outline-none focus:border-[#61AFEF]`}
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
                                  className={`p-1 rounded ${getHoverBg()} transition-colors cursor-pointer`}
                                  aria-label={t("dashboard.save")}
                                >
                                  <Check className="w-5 h-5 text-[#8DB472]" />
                                </button>
                                <button
                                  onClick={handleCancelEditUsername}
                                  className={`p-1 rounded ${getHoverBg()} transition-colors cursor-pointer`}
                                  aria-label={t("dashboard.cancel")}
                                >
                                  <X className={`w-5 h-5 ${getMutedText()}`} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h2 className={`text-xl font-semibold ${getTextColor()} whitespace-nowrap`}>{username}</h2>
                                <button
                                  onClick={handleEditUsername}
                                  className={`p-1 rounded ${getHoverBg()} transition-colors cursor-pointer`}
                                  aria-label={t("dashboard.edit")}
                                >
                                  <Pencil className={`w-4 h-4 ${getMutedText()}`} />
                                </button>
                              </div>
                            )}
                            <p className={`text-sm ${getMutedText()} whitespace-nowrap`}>{t("dashboard.userAccount")}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition border cursor-pointer whitespace-nowrap ${theme === "light"
                            ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            : "bg-red-900/50 text-red-400 hover:bg-red-900/70 border-red-800/50"
                            }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{t("dashboard.deleteAccount")}</span>
                        </button>
                      </div>
                    </section>

                    {/* Statistics Section */}
                    <section className="grid grid-cols-2 xl:grid-cols-4 gap-6">
                      <div className={`rounded-2xl border-2 border-[#C678DD] ${getCardBg()} p-6 overflow-hidden`}>
                        <p
                          className={`text-sm ${getMutedText()} whitespace-nowrap truncate`}
                          onMouseEnter={(e) => handleMouseEnter(e, t("dashboard.statistics.totalProjects"))}
                          onMouseMove={(e) => handleMouseMove(e, t("dashboard.statistics.totalProjects"))}
                          onMouseLeave={handleMouseLeave}
                        >{t("dashboard.statistics.totalProjects")}</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#C678DD] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, totalProjects.toString())}
                          onMouseMove={(e) => handleMouseMove(e, totalProjects.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{totalProjects}</p>
                      </div>
                      <div className={`rounded-2xl border-2 border-[#E5C07B] ${getCardBg()} p-6 overflow-hidden`}>
                        <p
                          className={`text-sm ${getMutedText()} whitespace-nowrap truncate`}
                          onMouseEnter={(e) => handleMouseEnter(e, t("dashboard.statistics.outlineStage"))}
                          onMouseMove={(e) => handleMouseMove(e, t("dashboard.statistics.outlineStage"))}
                          onMouseLeave={handleMouseLeave}
                        >{t("dashboard.statistics.outlineStage")}</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#E5C07B] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, step2Count.toString())}
                          onMouseMove={(e) => handleMouseMove(e, step2Count.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{step2Count}</p>
                      </div>
                      <div className={`rounded-2xl border-2 border-[#56B6C2] ${getCardBg()} p-6 overflow-hidden`}>
                        <p
                          className={`text-sm ${getMutedText()} whitespace-nowrap truncate`}
                          onMouseEnter={(e) => handleMouseEnter(e, t("dashboard.statistics.designStage"))}
                          onMouseMove={(e) => handleMouseMove(e, t("dashboard.statistics.designStage"))}
                          onMouseLeave={handleMouseLeave}
                        >{t("dashboard.statistics.designStage")}</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#56B6C2] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, step3Count.toString())}
                          onMouseMove={(e) => handleMouseMove(e, step3Count.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{step3Count}</p>
                      </div>
                      <div className={`rounded-2xl border-2 border-[#8DB472] ${getCardBg()} p-6 overflow-hidden`}>
                        <p
                          className={`text-sm ${getMutedText()} whitespace-nowrap truncate`}
                          onMouseEnter={(e) => handleMouseEnter(e, t("dashboard.statistics.deployed"))}
                          onMouseMove={(e) => handleMouseMove(e, t("dashboard.statistics.deployed"))}
                          onMouseLeave={handleMouseLeave}
                        >{t("dashboard.statistics.deployed")}</p>
                        <p
                          className="mt-4 text-4xl font-semibold text-[#8DB472] whitespace-nowrap truncate"
                          onMouseEnter={(e) => handleMouseEnter(e, step4Count.toString())}
                          onMouseMove={(e) => handleMouseMove(e, step4Count.toString())}
                          onMouseLeave={handleMouseLeave}
                        >{step4Count}</p>
                      </div>
                    </section>

                    {/* Projects List Section */}
                    <section className={`rounded-2xl border ${getBorderColor()} ${getCardBg()} p-6`}>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-lg font-medium ${getTextColor()} whitespace-nowrap`}>{t("dashboard.projects.currentProjects")}</h2>
                        <button
                          onClick={handleCreateNewCourse}
                          className={`rounded-md bg-[#61AFEF] px-4 py-2 text-sm font-medium transition hover:bg-[#82C6FF] whitespace-nowrap ${theme === "light" ? "text-white" : "text-[#1E2025]"
                            }`}
                        >
                          {t("dashboard.projects.createNewCourse")}
                        </button>
                      </div>
                      <div className="space-y-6">
                        {renderProjectSection(t("dashboard.statistics.outlineStage"), step2Projects)}
                        {step2Projects.length > 0 && (step3Projects.length > 0 || step4Projects.length > 0) && (
                          <div className={`border-t ${getBorderColor()}`} />
                        )}
                        {renderProjectSection(t("dashboard.statistics.designStage"), step3Projects)}
                        {step3Projects.length > 0 && step4Projects.length > 0 && (
                          <div className={`border-t ${getBorderColor()}`} />
                        )}
                        {renderProjectSection(t("dashboard.statistics.deployed"), step4Projects)}
                      </div>
                    </section>
                  </>
                )}

                {activeTab === "preferences" && (
                  <div>
                    <h2 className={`text-lg font-semibold ${getTextColor()} mb-6`}>{t("preferences.title")}</h2>
                    <section className={`rounded-2xl border ${getBorderColor()} ${getCardBg()} p-6 w-full`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className={`w-5 h-5 ${getTextColor()}`} />
                        <h3 className={`text-base font-semibold ${getTextColor()}`}>{t("preferences.theme.title")}</h3>
                      </div>
                      <p className={`text-sm ${getMutedText()} mb-4`}>{t("preferences.theme.description")}</p>
                      <div className={`relative flex p-1 rounded-lg ${getCardSurface()} border ${getBorderColor()}`}>
                        {/* Sliding indicator */}
                        <div
                          className={`absolute top-1 bottom-1 rounded-md ${getCardBg()} border ${getBorderColor()} transition-all duration-300 ease-in-out ${theme === "light"
                            ? "left-1 w-[calc(33.333%-0.333rem)]"
                            : theme === "dark"
                              ? "left-[calc(33.333%+0.167rem)] w-[calc(33.333%-0.333rem)]"
                              : "left-[calc(66.666%+0.333rem-0.25rem)] w-[calc(33.333%-0.333rem)]"
                            }`}
                        />
                        <button
                          onClick={() => handleThemeChange("light")}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors cursor-pointer flex-1 z-10 ${theme === "light"
                            ? getTextColor()
                            : getMutedText()
                            }`}
                        >
                          <Sun className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("preferences.theme.light")}</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors cursor-pointer flex-1 z-10 ${theme === "dark"
                            ? getTextColor()
                            : getMutedText()
                            }`}
                        >
                          <Moon className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("preferences.theme.dark")}</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("system")}
                          className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors cursor-pointer flex-1 z-10 ${theme === "system"
                            ? getTextColor()
                            : getMutedText()
                            }`}
                        >
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm font-medium">{t("preferences.theme.system")}</span>
                        </button>
                      </div>
                    </section>

                    {/* Language Settings */}
                    <section className={`rounded-2xl border ${getBorderColor()} ${getCardBg()} p-6 w-full mt-6`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Languages className={`w-5 h-5 ${getTextColor()}`} />
                          <div>
                            <h3 className={`text-base font-semibold ${getTextColor()}`}>{t("preferences.language.title")}</h3>
                            <p className={`text-sm ${getMutedText()}`}>{t("preferences.language.description")}</p>
                          </div>
                        </div>
                        <div className="relative" ref={languageDropdownRef}>
                          <button
                            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md ${getCardSurface()} border ${getBorderColor()} ${getTextColor()} text-sm font-medium transition-colors ${getHoverBg()} min-w-[140px]`}
                          >
                            <span>{currentLanguage === "en" ? t("preferences.language.english") : t("preferences.language.traditionalChinese")}</span>
                            <svg
                              className={`w-4 h-4 transition-transform ${showLanguageDropdown ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {showLanguageDropdown && (
                            <div className={`absolute top-full right-0 mt-2 rounded-md ${getCardBg()} border ${getBorderColor()} shadow-lg z-50 overflow-hidden min-w-[140px]`}>
                              <button
                                onClick={() => handleLanguageChange("en")}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                  currentLanguage === "en"
                                    ? `${getCardSurface()} ${getTextColor()} font-medium`
                                    : `${getTextColor()} ${getHoverBg()}`
                                }`}
                              >
                                {t("preferences.language.english")}
                              </button>
                              <button
                                onClick={() => handleLanguageChange("zh-TW")}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors border-t ${getBorderColor()} ${
                                  currentLanguage === "zh-TW"
                                    ? `${getCardSurface()} ${getTextColor()} font-medium`
                                    : `${getTextColor()} ${getHoverBg()}`
                                }`}
                              >
                                {t("preferences.language.traditionalChinese")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === "help-center" && (
                  <div>
                    <h2 className={`text-lg font-semibold ${getTextColor()} mb-6`}>{t("helpCenter.title")}</h2>
                    <section className={`rounded-2xl border ${getBorderColor()} ${getCardBg()} p-6 w-full`}>
                      <p className={`text-sm ${getMutedText()}`}>{t("helpCenter.content")}</p>
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
          className={`fixed z-50 px-3 py-2 rounded-md ${getCardSurface()} border ${getBorderColor()} text-sm ${getTextColor()} shadow-lg pointer-events-none`}
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
            className={`${getCardSurface()} border ${getBorderColor()} rounded-lg shadow-lg p-6 max-w-md w-full mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-xl font-semibold ${getTextColor()} mb-4`}>{t("dashboard.deleteModal.title")}</h2>
            <div className={`text-sm ${getMutedText()} mb-6 space-y-2`}>
              <p>{t("dashboard.deleteModal.confirmMessage")}</p>
              <p>
                {currentLanguage === "en" ? (
                  <>
                    {t("dashboard.deleteModal.warningMessage").split("CANNOT be undone")[0]}
                    <span className={`font-bold ${getTextColor()}`}>CANNOT be undone</span>
                    {t("dashboard.deleteModal.warningMessage").split("CANNOT be undone")[1]}
                  </>
                ) : (
                  t("dashboard.deleteModal.warningMessage")
                )}
              </p>
              <p className="mt-4">{t("dashboard.deleteModal.confirmInstruction")}</p>
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t("dashboard.deleteModal.placeholder")}
              className={`w-full px-4 py-2 rounded-md ${getCardBg()} border ${getBorderColor()} ${getTextColor()} mb-6 focus:outline-none focus:border-[#61AFEF]`}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className={`px-4 py-2 rounded-md border ${getBorderColor()} ${getCardBg()} ${getTextColor()} text-sm font-medium transition ${getHoverBg()} cursor-pointer`}
              >
                {t("dashboard.deleteModal.cancel")}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText !== "DELETE"}
                className={`px-4 py-2 rounded-md text-sm font-medium transition border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${theme === "light"
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  : "bg-red-900/50 text-red-400 hover:bg-red-900/70 border-red-800/50"
                  }`}
              >
                {t("dashboard.deleteModal.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

