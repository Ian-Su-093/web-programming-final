import { useRef, useState, useEffect } from "react"
import type { ChangeEvent, DragEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import "@/App.css"
import { Sidebar } from "@/components/Sidebar"
import { createCourse } from "@/lib/api"

const MAX_FILES = 10
const MAX_TOTAL_SIZE = 31 * 1024 * 1024 // 31MB in bytes

export function UploadPage() {
  const { t } = useTranslation()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [isCreatingCourse, setIsCreatingCourse] = useState(false)
  const [showCourseNameModal, setShowCourseNameModal] = useState(false)
  const [courseName, setCourseName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const courseNameInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

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

  const getHoverBg = () => {
    if (theme === "light") return "hover:bg-gray-100"
    return "hover:bg-[#282C34]"
  }

  const validateFiles = (files: File[], currentFiles: File[]) => {
    const validFiles: File[] = []
    let validationError: string | null = null

    // Calculate current total size
    const currentTotalSize = currentFiles.reduce((sum, file) => sum + file.size, 0)

    for (const file of files) {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")

      if (!isPdf) {
        validationError = t("upload.errors.onlyPdf")
        continue
      }

      // Check if adding this file would exceed total size limit
      const newTotalSize = currentTotalSize + file.size
      if (newTotalSize > MAX_TOTAL_SIZE) {
        validationError = t("upload.errors.maxTotalSizeExceeded") || `Total file size cannot exceed ${(MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0)}MB`
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0 && files.length > 0) {
      setError(validationError || t("upload.errors.uploadPdf"))
      return []
    }

    const newCount = currentFiles.length + validFiles.length

    if (newCount > MAX_FILES) {
      const allowedCount = MAX_FILES - currentFiles.length
      if (allowedCount > 0) {
        setError(t("upload.errors.maxFilesExceeded", { maxFiles: MAX_FILES, allowedCount }))
        return validFiles.slice(0, allowedCount)
      } else {
        setError(t("upload.errors.maxFilesReached", { maxFiles: MAX_FILES }))
        return []
      }
    }

    setError(null)
    return validFiles
  }

  const addFiles = (newFiles: File[]) => {
    setSelectedFiles((prev) => {
      const validFiles = validateFiles(newFiles, prev)
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

  const handleNextStep = () => {
    // Prevent multiple clicks while creating course
    if (isCreatingCourse) {
      return
    }

    // Check if files are selected (1-10 files)
    if (selectedFiles.length === 0) {
      setError(t("upload.errors.noFilesSelected"))
      return
    }

    if (selectedFiles.length > MAX_FILES) {
      setError(t("upload.errors.maxFilesReached", { maxFiles: MAX_FILES }))
      return
    }

    // Check total file size
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      setError(t("upload.errors.maxTotalSizeExceeded") || `Total file size cannot exceed ${(MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0)}MB`)
      return
    }

    // Show modal to get course name
    setCourseName("")
    setShowCourseNameModal(true)
  }

  const handleCreateCourse = async () => {
    if (!courseName.trim()) {
      setError(t("upload.errors.courseNameRequired") || "Please enter a course name.")
      return
    }

    try {
      setShowCourseNameModal(false)
      setIsCreatingCourse(true)
      setError(null)

      // Create the course with selected files
      const response = await createCourse(courseName.trim(), selectedFiles)

      if (response.status === "success" && response.course) {
        // Navigate to outline page with the created course ID
        navigate(`/${response.course.id}/outline`)
      } else {
        setError(t("upload.errors.courseCreationFailed") || "Failed to create course. Please try again.")
      }
    } catch (err) {
      console.error("Failed to create course:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create course. Please try again."
      setError(errorMessage)
    } finally {
      setIsCreatingCourse(false)
    }
  }

  const handleCloseModal = () => {
    setShowCourseNameModal(false)
    setCourseName("")
    setError(null)
  }

  // Focus input when modal opens
  useEffect(() => {
    if (showCourseNameModal && courseNameInputRef.current) {
      setTimeout(() => {
        courseNameInputRef.current?.focus()
      }, 100)
    }
  }, [showCourseNameModal])

  return (
    <div className={`flex h-screen ${getBgColor()} overflow-hidden ${getTextColor()}`}>
      <Sidebar
        ref={sidebarRef}
        currentStep={1}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-10 overflow-auto" onClick={handleMainContentClick}>
        <div className="w-full max-w-2xl">
          <header className="mb-8">
            <h1 className={`text-3xl font-semibold mb-3 ${getTextColor()}`}>{t("upload.title")}</h1>
            <p className={`text-sm ${getMutedText()}`}>
              {t("upload.description", { maxFiles: MAX_FILES })}
            </p>
          </header>

          <section
            className={`border-2 border-dashed rounded-2xl ${getCardBg()} transition-colors duration-200 ${isDragging
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
                <span className={`text-lg font-medium ${getTextColor()}`}>{t("upload.dragDrop")}</span>
                <span className={`text-sm ${getMutedText()}`}>
                  {t("upload.onlyPdfSupported")}
                  {selectedFiles.length > 0 && ` ${t("upload.filesSelected", { count: selectedFiles.length, maxFiles: MAX_FILES })}`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleBrowseClick}
                disabled={selectedFiles.length >= MAX_FILES}
                className={`px-6 py-2 rounded-md bg-[#61AFEF] font-medium hover:bg-[#82C6FF] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${theme === "light" ? "text-white" : "text-[#1E2025]"
                  }`}
              >
                {t("upload.browseFiles")}
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
                    {t("upload.remove")}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              disabled={isCreatingCourse || selectedFiles.length === 0 || selectedFiles.length > MAX_FILES}
              className={`px-4 py-1.5 text-sm rounded-md bg-[#61AFEF] font-medium hover:bg-[#82C6FF] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${theme === "light" ? "text-white" : "text-[#1E2025]"
                }`}
            >
              {t("upload.nextStep")}
            </button>
          </div>

          {isCreatingCourse && (
            <div className={`mt-6 rounded-xl border ${theme === "light"
              ? "border-blue-300 bg-blue-50 text-blue-800"
              : "border-[#61AFEF] bg-[#1E2A3A] text-[#82C6FF]"
              } px-5 py-3 text-sm flex items-center gap-2`}>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>{t("upload.creatingCourse") || "Creating course..."}</span>
            </div>
          )}

          {error && (
            <div className={`mt-6 rounded-xl border ${theme === "light"
              ? "border-red-300 bg-red-50 text-red-800"
              : "border-[#FF6B6B] bg-[#2B1F23] text-[#FF8A8A]"
              } px-5 py-3 text-sm`}>
              {error}
            </div>
          )}
        </div>
      </main>

      {/* Course Name Modal */}
      {showCourseNameModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseModal}
        >
          <div
            className={`${getCardBg()} border ${getBorderColor()} rounded-lg shadow-lg p-6 max-w-md w-full mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-xl font-semibold ${getTextColor()} mb-4`}>
              {t("upload.courseNameModal.title") || "Enter Course Name"}
            </h2>
            <p className={`text-sm ${getMutedText()} mb-4`}>
              {t("upload.courseNameModal.description") || "Please enter a name for your course."}
            </p>
            <input
              ref={courseNameInputRef}
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateCourse()
                } else if (e.key === "Escape") {
                  handleCloseModal()
                }
              }}
              placeholder={t("upload.courseNameModal.placeholder") || "Course name"}
              className={`w-full px-4 py-2 rounded-md ${getCardBg()} border ${getBorderColor()} ${getTextColor()} mb-6 focus:outline-none focus:border-[#61AFEF]`}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className={`px-4 py-2 rounded-md border ${getBorderColor()} ${getTextColor()} ${getHoverBg()} transition-colors cursor-pointer`}
              >
                {t("upload.courseNameModal.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={!courseName.trim()}
                className={`px-4 py-2 rounded-md bg-[#61AFEF] font-medium hover:bg-[#82C6FF] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${theme === "light" ? "text-white" : "text-[#1E2025]"
                  }`}
              >
                {t("upload.courseNameModal.create") || "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


