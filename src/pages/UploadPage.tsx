import { useRef, useState, useEffect } from "react"
import type { ChangeEvent, DragEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "@/App.css"
import { Sidebar } from "@/components/Sidebar"

const MAX_FILES = 10

export function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "dark"
  })

  // Apply theme on mount and when theme changes
  useEffect(() => {
    // Remove all theme classes first
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

  // Listen for theme changes from other pages
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
    window.addEventListener("storage", handleStorageChange)
    // Also check periodically in case of same-tab updates
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

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#9DA5B4]"
  }

  const getDragAreaBg = () => {
    if (theme === "light") return "bg-blue-50"
    return "bg-[#2C313C]"
  }

  const validateFiles = (files: File[], currentFileCount: number) => {
    const validFiles: File[] = []
    let validationError: string | null = null

    for (const file of files) {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")

      if (!isPdf) {
        validationError = "Please upload only PDF files."
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0 && files.length > 0) {
      setError(validationError || "Please upload PDF files.")
      return []
    }

    const newCount = currentFileCount + validFiles.length

    if (newCount > MAX_FILES) {
      const allowedCount = MAX_FILES - currentFileCount
      if (allowedCount > 0) {
        setError(`You can only upload up to ${MAX_FILES} files. Only the first ${allowedCount} file(s) will be added.`)
        return validFiles.slice(0, allowedCount)
      } else {
        setError(`You can only upload up to ${MAX_FILES} files. Please remove some files first.`)
        return []
      }
    }

    setError(null)
    return validFiles
  }

  const addFiles = (newFiles: File[]) => {
    setSelectedFiles((prev) => {
      const validFiles = validateFiles(newFiles, prev.length)
      if (validFiles.length > 0) {
        return [...prev, ...validFiles]
      }
      return prev
    })
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const files = Array.from(event.dataTransfer.files || [])
    if (files.length === 0) return

    addFiles(files)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    addFiles(files)
    
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setError(null)
  }

  const formatFileSize = (sizeInBytes: number) => {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024)
    if (sizeInMegabytes < 0.1) {
      const sizeInKilobytes = sizeInBytes / 1024
      return `${sizeInKilobytes.toFixed(1)} KB`
    }

    return `${sizeInMegabytes.toFixed(1)} MB`
  }

  const handleMainContentClick = (e: React.MouseEvent) => {
    if (!isSidebarCollapsed && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      setIsSidebarCollapsed(true)
    }
  }

  return (
    <div className={`flex h-screen ${getBgColor()} overflow-hidden ${getTextColor()}`}>
      <Sidebar 
        ref={sidebarRef}
        currentStep={1} 
        onStepSelect={(step) => step === 1 && id && navigate(`/${id}/outline`)}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-10 overflow-auto" onClick={handleMainContentClick}>
        <div className="w-full max-w-2xl">
          <header className="mb-8">
            <h1 className={`text-3xl font-semibold mb-3 ${getTextColor()}`}>Upload your course materials</h1>
            <p className={`text-sm ${getMutedText()}`}>
              Upload up to {MAX_FILES} PDF files to kick-start outline generation. Your documents remain private and are only used for this session.
            </p>
          </header>

          <section
            className={`border-2 border-dashed rounded-2xl ${getCardBg()} transition-colors duration-200 ${
              isDragging 
                ? `border-[#61AFEF] ${getDragAreaBg()}` 
                : theme === "light" 
                  ? "border-gray-300" 
                  : "border-[#3E4451]"
            } ${selectedFiles.length >= MAX_FILES ? "opacity-50 cursor-not-allowed" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center text-center gap-4 px-10 py-14">
              <div className="flex flex-col gap-1">
                <span className={`text-lg font-medium ${getTextColor()}`}>Drag &amp; drop your PDF files here</span>
                <span className={`text-sm ${getMutedText()}`}>
                  Only PDF files are supported at the moment
                  {selectedFiles.length > 0 && ` (${selectedFiles.length}/${MAX_FILES} files selected)`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleBrowseClick}
                disabled={selectedFiles.length >= MAX_FILES}
                className={`px-6 py-2 rounded-md bg-[#61AFEF] font-medium hover:bg-[#82C6FF] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === "light" ? "text-white" : "text-[#1E2025]"
                }`}
              >
                Browse files
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </section>

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={`flex items-center justify-between ${getCardBg()} border ${getBorderColor()} rounded-xl px-5 py-4`}
                >
                  <div className="flex flex-col text-left flex-1 min-w-0">
                    <span className={`text-sm font-medium truncate ${getTextColor()}`}>{file.name}</span>
                    <span className={`text-xs ${getMutedText()}`}>{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-[#FF6B6B] dark:hover:text-[#FF8A8A] transition-colors ml-4 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className={`mt-6 rounded-xl border ${
              theme === "light" 
                ? "border-red-300 bg-red-50 text-red-800" 
                : "border-[#FF6B6B] bg-[#2B1F23] text-[#FF8A8A]"
            } px-5 py-3 text-sm`}>
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


