import { useState, useEffect, useRef, forwardRef } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Menu, X, User, CheckCircle2, Circle, LogOut, LayoutDashboard } from "lucide-react"

type SidebarProps = {
  currentStep?: 1 | 2 | 3
  onStepSelect?: (step: 1 | 2 | 3) => void
  isCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

type StepState = "completed" | "current" | "upcoming"

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ currentStep = 2, onStepSelect, isCollapsed: externalIsCollapsed, onCollapseChange }, ref) => {
  const { t } = useTranslation()
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true)
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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
  const getSidebarBg = () => {
    if (theme === "light") return "bg-gray-50"
    return "bg-[#1E2025]"
  }

  const getBorderColor = () => {
    if (theme === "light") return "border-gray-200"
    return "border-[#3E4451]"
  }

  const getTextColor = () => {
    if (theme === "light") return "text-gray-800"
    return "text-[#E0E0E0]"
  }

  const getHoverBg = () => {
    if (theme === "light") return "hover:bg-gray-100"
    return "hover:bg-[#282C34]"
  }

  const getCardBg = () => {
    if (theme === "light") return "bg-white"
    return "bg-[#282C34]"
  }

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#5C6370]"
  }

  const getConnectorColor = (isCompleted: boolean) => {
    if (isCompleted) return "bg-[#61AFEF]"
    if (theme === "light") return "bg-gray-300"
    return "bg-[#3E4451]"
  }

  const getStepState = (step: 1 | 2 | 3): StepState => {
    if (step < currentStep) return "completed"
    if (step === currentStep) return "current"
    return "upcoming"
  }

  const getIcon = (state: StepState) => {
    if (state === "completed") {
      return <CheckCircle2 className="w-8 h-8 text-[#8DB472] flex-shrink-0" />
    }

    if (state === "current") {
      return <Circle className="w-8 h-8 text-[#61AFEF] fill-[#61AFEF] flex-shrink-0" />
    }

    return <Circle className="w-8 h-8 text-[#5C6370] flex-shrink-0" />
  }

  const getCollapsedIcon = (state: StepState) => {
    if (state === "completed") {
      return <CheckCircle2 className="w-5 h-5 text-[#8DB472]" />
    }

    if (state === "current") {
      return <Circle className="w-5 h-5 text-[#61AFEF] fill-[#61AFEF]" />
    }

    return <Circle className="w-5 h-5 text-[#5C6370]" />
  }

  const getStepTextClasses = (state: StepState) => {
    if (state === "current") {
      return `text-xs ${getTextColor()} font-semibold opacity-0 animate-[fadeIn_0.3s_ease-in-out_0.2s_forwards] whitespace-nowrap`
    }

    if (state === "completed") {
      return "text-xs text-[#8DB472] opacity-0 animate-[fadeIn_0.3s_ease-in-out_0.1s_forwards] whitespace-nowrap"
    }

    return `text-xs ${getMutedText()} opacity-0 animate-[fadeIn_0.3s_ease-in-out_0.3s_forwards] whitespace-nowrap`
  }

  const step1State = getStepState(1)
  const step2State = getStepState(2)
  const step3State = getStepState(3)

  const isStepDisabled = (step: 1 | 2 | 3) => {
    return step > currentStep
  }

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed
    if (onCollapseChange) {
      onCollapseChange(newCollapsed)
    } else {
      setInternalIsCollapsed(newCollapsed)
    }
  }

  const handleUserClick = () => {
    // If sidebar is collapsed, expand it first
    if (isCollapsed) {
      const newCollapsed = false
      if (onCollapseChange) {
        onCollapseChange(newCollapsed)
      } else {
        setInternalIsCollapsed(newCollapsed)
      }
      // Show menu after sidebar expands
      setTimeout(() => {
        setShowUserMenu(true)
      }, 100)
    } else {
      setShowUserMenu(!showUserMenu)
    }
  }

  const handleDashboard = () => {
    setShowUserMenu(false)
    navigate("/user/dashboard")
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    // Redirect to login page
    navigate("/login")
  }

  const handleStepClick = (step: 1 | 2 | 3) => {
    if (isStepDisabled(step)) return

    if (onStepSelect) {
      onStepSelect(step)
      return
    }

    switch (step) {
      case 1:
        console.log("Upload files clicked")
        break
      case 2:
        console.log("Modify course outline clicked")
        break
      case 3:
        console.log("Modify website layout clicked")
        break
      default:
        break
    }
  }

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

  const handleSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div ref={ref} onClick={handleSidebarClick} className={`h-screen ${getSidebarBg()} border-r ${getBorderColor()} flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      {/* Hamburger Menu */}
      <div className="relative p-4">
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 left-3 w-10 h-10 flex items-center justify-center p-2 rounded-md ${getHoverBg()} transition-colors flex-shrink-0 cursor-pointer`}
          aria-label={t("sidebar.toggleSidebar")}
        >
          {isCollapsed ? (
            <Menu className={`w-5 h-5 ${getTextColor()}`} />
          ) : (
            <X className={`w-5 h-5 ${getTextColor()}`} />
          )}
        </button>
      </div>

      {/* Steps Indicator */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col items-start justify-center py-8 gap-4 px-4">
          {/* Step 1 - Completed */}
          <button
            onClick={() => handleStepClick(1)}
            className={`w-full flex items-center gap-3 ${getHoverBg()} rounded-md p-2 transition-colors cursor-pointer`}
            aria-label={t("sidebar.steps.uploadFiles")}
          >
            {getIcon(step1State)}
            <span className={getStepTextClasses(step1State)}>{t("sidebar.steps.uploadFiles")}</span>
          </button>

          {/* Connector Line */}
          <div className={`w-px h-8 ml-[1.5rem] ${getConnectorColor(step1State === "completed")}`} />

          {/* Step 2 - Current */}
          <button
            onClick={() => handleStepClick(2)}
            disabled={isStepDisabled(2)}
            className={`w-full flex items-center gap-3 rounded-md p-2 transition-colors ${isStepDisabled(2)
              ? "cursor-not-allowed opacity-50"
              : `${getHoverBg()} cursor-pointer`
              }`}
            aria-label={t("sidebar.steps.modifyCourseOutline")}
          >
            {getIcon(step2State)}
            <span className={getStepTextClasses(step2State)}>{t("sidebar.steps.modifyCourseOutline")}</span>
          </button>

          {/* Connector Line */}
          <div className={`w-px h-8 ml-[1.5rem] ${getConnectorColor(step2State === "completed")}`} />

          {/* Step 3 - Upcoming */}
          <button
            onClick={() => handleStepClick(3)}
            disabled={isStepDisabled(3)}
            className={`w-full flex items-center gap-3 rounded-md p-2 transition-colors ${isStepDisabled(3)
              ? "cursor-not-allowed opacity-50"
              : `${getHoverBg()} cursor-pointer`
              }`}
            aria-label={t("sidebar.steps.modifyWebsiteLayout")}
          >
            {getIcon(step3State)}
            <span className={getStepTextClasses(step3State)}>{t("sidebar.steps.modifyWebsiteLayout")}</span>
          </button>
        </div>
      )}

      {/* Collapsed Steps Indicator */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 gap-4">
          <button
            onClick={() => handleStepClick(1)}
            className={`${getHoverBg()} rounded-md p-1 transition-colors cursor-pointer`}
            aria-label={t("sidebar.steps.uploadFiles")}
          >
            {getCollapsedIcon(step1State)}
          </button>
          <div className={`w-px h-6 ${getConnectorColor(step1State === "completed")}`} />
          <button
            onClick={() => handleStepClick(2)}
            disabled={isStepDisabled(2)}
            className={`rounded-md p-1 transition-colors ${isStepDisabled(2)
              ? "cursor-not-allowed opacity-50"
              : `${getHoverBg()} cursor-pointer`
              }`}
            aria-label={t("sidebar.steps.modifyCourseOutline")}
          >
            {getCollapsedIcon(step2State)}
          </button>
          <div className={`w-px h-6 ${getConnectorColor(step2State === "completed")}`} />
          <button
            onClick={() => handleStepClick(3)}
            disabled={isStepDisabled(3)}
            className={`rounded-md p-1 transition-colors ${isStepDisabled(3)
              ? "cursor-not-allowed opacity-50"
              : `${getHoverBg()} cursor-pointer`
              }`}
            aria-label={t("sidebar.steps.modifyWebsiteLayout")}
          >
            {getCollapsedIcon(step3State)}
          </button>
        </div>
      )}

      {/* Avatar and Username */}
      <div ref={userMenuRef} className={`p-4 ${isCollapsed ? "flex items-center justify-center" : ""} relative`}>
        {isCollapsed ? (
          <button
            onClick={handleUserClick}
            className={`w-10 h-10 rounded-full ${getCardBg()} flex items-center justify-center border ${getBorderColor()} ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-[#3E4451]"} transition-colors flex-shrink-0 cursor-pointer`}
            aria-label={t("sidebar.userMenu")}
          >
            <User className={`w-5 h-5 ${getTextColor()}`} />
          </button>
        ) : (
          <button
            onClick={handleUserClick}
            className={`w-full flex items-center gap-3 ${getHoverBg()} rounded-md p-2 transition-colors cursor-pointer`}
            aria-label={t("sidebar.userMenu")}
          >
            <div className={`w-10 h-10 rounded-full ${getCardBg()} flex items-center justify-center border ${getBorderColor()} flex-shrink-0`}>
              <User className={`w-5 h-5 ${getTextColor()}`} />
            </div>
            <span className={`text-sm ${getTextColor()} font-medium`}>{t("sidebar.guest")}</span>
          </button>
        )}

        {/* User Menu */}
        {showUserMenu && (
          <div className={`absolute bottom-full mb-2 ${isCollapsed ? "left-0 right-0" : "left-4 right-4"}`}>
            <div className={`${getCardBg()} border ${getBorderColor()} rounded-md shadow-lg overflow-hidden flex flex-col gap-0`}>
              {/* Dashboard Button */}
              <button
                onClick={handleDashboard}
                className={`w-full flex items-center gap-3 px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#3E4451]"} transition-colors text-sm ${getTextColor()} cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
              >
                <LayoutDashboard className={`w-4 h-4 ${getTextColor()}`} />
                {!isCollapsed && <span>{t("sidebar.dashboard")}</span>}
              </button>

              {/* Divider */}
              <div className={`h-px ${getBorderColor()}`} />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-[#3E4451]"} transition-colors text-sm text-red-600 dark:text-red-400 cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                {!isCollapsed && <span>{t("sidebar.logout")}</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

Sidebar.displayName = "Sidebar"
