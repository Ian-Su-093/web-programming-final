import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Menu, X, User, CheckCircle2, Circle, LogOut, LayoutDashboard } from "lucide-react"

type SidebarProps = {
  currentStep?: 1 | 2 | 3
  onStepSelect?: (step: 1 | 2 | 3) => void
}

type StepState = "completed" | "current" | "upcoming"

export function Sidebar({ currentStep = 2, onStepSelect }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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
      return "text-xs text-[#E0E0E0] font-semibold opacity-0 animate-[fadeIn_0.3s_ease-in-out_0.2s_forwards] whitespace-nowrap"
    }

    if (state === "completed") {
      return "text-xs text-[#8DB472] opacity-0 animate-[fadeIn_0.3s_ease-in-out_0.1s_forwards] whitespace-nowrap"
    }

    return "text-xs text-[#5C6370] opacity-0 animate-[fadeIn_0.3s_ease-in-out_0.3s_forwards] whitespace-nowrap"
  }

  const step1State = getStepState(1)
  const step2State = getStepState(2)
  const step3State = getStepState(3)

  const isStepDisabled = (step: 1 | 2 | 3) => {
    return step > currentStep
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleUserClick = () => {
    // If sidebar is collapsed, expand it first
    if (isCollapsed) {
      setIsCollapsed(false)
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
    // Dummy logout function
    console.log("Logout clicked")
    setShowUserMenu(false)
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

  return (
    <div className={`h-screen bg-[#1E2025] border-r border-[#3E4451] flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      {/* Hamburger Menu */}
      <div className="relative p-4">
        <button
          onClick={toggleSidebar}
          className="absolute top-4 left-3 w-10 h-10 flex items-center justify-center p-2 rounded-md hover:bg-[#282C34] transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <Menu className="w-5 h-5 text-[#E0E0E0]" />
          ) : (
            <X className="w-5 h-5 text-[#E0E0E0]" />
          )}
        </button>
      </div>

      {/* Steps Indicator */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col items-start justify-center py-8 gap-4 px-4">
          {/* Step 1 - Completed */}
          <button
            onClick={() => handleStepClick(1)}
            className="w-full flex items-center gap-3 hover:bg-[#282C34] rounded-md p-2 transition-colors cursor-pointer"
            aria-label="Upload files"
          >
            {getIcon(step1State)}
            <span className={getStepTextClasses(step1State)}>Upload files</span>
          </button>

          {/* Connector Line */}
          <div className={`w-px h-8 ml-[1.5rem] ${step1State === "completed" ? "bg-[#61AFEF]" : "bg-[#3E4451]"}`} />

          {/* Step 2 - Current */}
          <button
            onClick={() => handleStepClick(2)}
            disabled={isStepDisabled(2)}
            className={`w-full flex items-center gap-3 rounded-md p-2 transition-colors ${
              isStepDisabled(2)
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-[#282C34] cursor-pointer"
            }`}
            aria-label="Modify course outline"
          >
            {getIcon(step2State)}
            <span className={getStepTextClasses(step2State)}>Modify course outline</span>
          </button>

          {/* Connector Line */}
          <div className={`w-px h-8 ml-[1.5rem] ${step2State === "completed" ? "bg-[#61AFEF]" : "bg-[#3E4451]"}`} />

          {/* Step 3 - Upcoming */}
          <button
            onClick={() => handleStepClick(3)}
            disabled={isStepDisabled(3)}
            className={`w-full flex items-center gap-3 rounded-md p-2 transition-colors ${
              isStepDisabled(3)
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-[#282C34] cursor-pointer"
            }`}
          >
            {getIcon(step3State)}
            <span className={getStepTextClasses(step3State)}>Modify website layout</span>
          </button>
        </div>
      )}

      {/* Collapsed Steps Indicator */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 gap-4">
          <button
            onClick={() => handleStepClick(1)}
            className="hover:bg-[#282C34] rounded-md p-1 transition-colors cursor-pointer"
            aria-label="Upload files"
          >
            {getCollapsedIcon(step1State)}
          </button>
          <div className={`w-px h-6 ${step1State === "completed" ? "bg-[#61AFEF]" : "bg-[#3E4451]"}`} />
          <button
            onClick={() => handleStepClick(2)}
            disabled={isStepDisabled(2)}
            className={`rounded-md p-1 transition-colors ${
              isStepDisabled(2)
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-[#282C34] cursor-pointer"
            }`}
            aria-label="Modify course outline"
          >
            {getCollapsedIcon(step2State)}
          </button>
          <div className={`w-px h-6 ${step2State === "completed" ? "bg-[#61AFEF]" : "bg-[#3E4451]"}`} />
          <button
            onClick={() => handleStepClick(3)}
            disabled={isStepDisabled(3)}
            className={`rounded-md p-1 transition-colors ${
              isStepDisabled(3)
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-[#282C34] cursor-pointer"
            }`}
            aria-label="Modify website layout"
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
            className="w-10 h-10 rounded-full bg-[#282C34] flex items-center justify-center border border-[#3E4451] hover:bg-[#3E4451] transition-colors flex-shrink-0 cursor-pointer"
            aria-label="User menu"
          >
            <User className="w-5 h-5 text-[#E0E0E0]" />
          </button>
        ) : (
          <button
            onClick={handleUserClick}
            className="w-full flex items-center gap-3 hover:bg-[#282C34] rounded-md p-2 transition-colors cursor-pointer"
            aria-label="User menu"
          >
            <div className="w-10 h-10 rounded-full bg-[#282C34] flex items-center justify-center border border-[#3E4451] flex-shrink-0">
              <User className="w-5 h-5 text-[#E0E0E0]" />
            </div>
            <span className="text-sm text-[#E0E0E0] font-medium">Guest</span>
          </button>
        )}

        {/* User Menu */}
        {showUserMenu && (
          <div className={`absolute bottom-full mb-2 ${isCollapsed ? "left-0 right-0" : "left-4 right-4"}`}>
            <div className="bg-[#282C34] border border-[#3E4451] rounded-md shadow-lg overflow-hidden flex flex-col gap-0">
              {/* Dashboard Button */}
              <button
                onClick={handleDashboard}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-[#3E4451] transition-colors text-sm text-[#E0E0E0] cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#E0E0E0]" />
                {!isCollapsed && <span>Dashboard</span>}
              </button>

              {/* Divider */}
              <div className="h-px bg-[#3E4451]" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-[#3E4451] transition-colors text-sm text-red-400 cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
              >
                <LogOut className="w-4 h-4 text-red-400" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

