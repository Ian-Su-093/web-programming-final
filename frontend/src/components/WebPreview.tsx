import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ChevronFirst, ChevronLast, Monitor, ExternalLink } from "lucide-react"
import { Sandpack } from "@codesandbox/sandpack-react"
import { getCourseReactFiles } from "@/lib/api"

interface WebPreviewProps {
  onToggleChat: () => void
  onHidePreview?: () => void
  onShowChat?: () => void
  isChatHidden: boolean
  isSwapped?: boolean
  id?: string
}

export function WebPreview({ onToggleChat, onHidePreview, onShowChat, isChatHidden, isSwapped = false, id }: WebPreviewProps) {
  const { t } = useTranslation()
  const [reactFiles, setReactFiles] = useState<Record<string, string> | null>(null)
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "dark"
  })

  // Fetch React files when id is available
  useEffect(() => {
    const fetchReactFiles = async () => {
      if (!id) return

      console.log("Fetching React files for course:", id)
      setIsLoadingFiles(true)
      try {
        const files = await getCourseReactFiles(id)
        console.log("React files received from API:", files)
        // Filter to only include the required files
        const allowedFiles = ["index.html", "index.tsx", "index.css", "package.json"]
        const filteredFiles: Record<string, string> = {}
        for (const key of allowedFiles) {
          if (files[key]) {
            filteredFiles[key] = files[key]
          }
        }
        console.log("Filtered React files:", filteredFiles)
        // Clean package.json to remove local file dependencies that Sandpack can't resolve
        if (filteredFiles["package.json"]) {
          try {
            const packageJson = JSON.parse(filteredFiles["package.json"])
            // Remove local file dependencies
            if (packageJson.dependencies) {
              Object.keys(packageJson.dependencies).forEach((dep) => {
                if (packageJson.dependencies[dep]?.startsWith("file:")) {
                  delete packageJson.dependencies[dep]
                }
              })
            }
            filteredFiles["package.json"] = JSON.stringify(packageJson, null, 2)
            console.log("Cleaned package.json:", filteredFiles["package.json"])
          } catch (error) {
            console.error("Failed to parse/clean package.json:", error)
          }
        }
        // Check if we got any files
        if (Object.keys(filteredFiles).length > 0) {
          // Ensure CSS is imported in index.tsx (Sandpack requires CSS to be imported, not linked in HTML)
          if (filteredFiles["index.tsx"] && filteredFiles["index.css"]) {
            const indexTsx = filteredFiles["index.tsx"]
            // Check if CSS is already imported (look for import statement with index.css)
            const hasCssImport = /import\s+['"].*index\.css['"]/.test(indexTsx)
            if (!hasCssImport) {
              // Add CSS import at the top of the file, after React imports if they exist
              const reactImportMatch = indexTsx.match(/^import\s+.*?from\s+['"]react['"].*?\n/)
              if (reactImportMatch) {
                // Insert after React imports
                const insertIndex = reactImportMatch[0].length
                filteredFiles["index.tsx"] =
                  indexTsx.slice(0, insertIndex) +
                  "import './index.css';\n" +
                  indexTsx.slice(insertIndex)
              } else {
                // Insert at the very beginning
                filteredFiles["index.tsx"] = "import './index.css';\n" + indexTsx
              }
              console.log("Added CSS import to index.tsx")
            }
          }

          // Convert API response keys to Sandpack format (add leading slash)
          // Also move index.tsx and index.css to src/ directory to match index.html references
          const sandpackFiles: Record<string, string> = {}
          for (const [key, value] of Object.entries(filteredFiles)) {
            let sandpackKey = key.startsWith("/") ? key : `/${key}`
            // Move index.tsx and index.css to src/ directory
            if (key === "index.tsx" || key === "index.css") {
              sandpackKey = `/src/${key}`
            }
            sandpackFiles[sandpackKey] = value
          }
          console.log("React files converted for Sandpack:", sandpackFiles)
          setReactFiles(sandpackFiles)
          // If files came back, treat as hasFiles true for rendering
          setIsLoadingFiles(false)
        } else {
          console.log("No React files received from API")
          setReactFiles(null)
          setIsLoadingFiles(false)
        }
      } catch (error) {
        console.error("Failed to fetch React files:", error)
        setReactFiles(null)
        setIsLoadingFiles(false)
      }
    }

    fetchReactFiles()
  }, [id])

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
    return "bg-[#1E2025]"
  }

  const getMutedText = () => {
    if (theme === "light") return "text-gray-600"
    return "text-[#5B6B83]"
  }

  const getHoverBg = () => {
    if (theme === "light") return "hover:bg-gray-100"
    return "hover:bg-[#3E4451]"
  }

  const getDividerColor = () => {
    if (theme === "light") return "bg-gray-200"
    return "bg-[#3E4451]"
  }
  const handleOpenInNewTab = () => {
    // Hide the preview panel in the current tab
    if (onHidePreview) {
      onHidePreview()
    }
    // Show the chat section if it's hidden
    if (isChatHidden && onShowChat) {
      onShowChat()
    }
    // Open the full page preview in a new tab
    if (id) {
      window.open(`/${id}/web-preview`, "_blank")
    }
  }

  return (
    <div className={`h-screen ${getBgColor()} flex flex-col`}>
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              {!isSwapped && (
                <button
                  onClick={onToggleChat}
                  className={`${getHoverBg()} rounded p-1 transition-colors`}
                  aria-label={t("outline.webDesign.preview.toggleChat")}
                >
                  {isChatHidden ? (
                    <ChevronLast className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  ) : (
                    <ChevronFirst className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  )}
                </button>
              )}
              <h2 className={`text-sm font-semibold ${getMutedText()} uppercase tracking-[0.4rem]`}>
                {t("outline.webDesign.preview.title")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenInNewTab}
                className={`${getHoverBg()} rounded p-1 transition-colors`}
                aria-label={t("outline.webDesign.preview.openInNewTab")}
                title={t("outline.webDesign.preview.openInNewTab")}
              >
                <ExternalLink className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
              </button>
              {isSwapped && (
                <button
                  onClick={onToggleChat}
                  className={`${getHoverBg()} rounded p-1 transition-colors`}
                  aria-label={t("outline.webDesign.preview.toggleChat")}
                >
                  {isChatHidden ? (
                    <ChevronFirst className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  ) : (
                    <ChevronLast className={`w-5 h-5 ${getMutedText()} cursor-pointer`} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={`w-full h-px ${getDividerColor()} mb-6`}></div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-hidden p-6 pt-0 flex flex-col">
        {/* Embedded preview - always light theme */}
        <div className="w-full flex-1 min-h-0 bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col">
          {isLoadingFiles ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse" />
                <p className="text-gray-600 text-lg">
                  {t("outline.webDesign.preview.loading")}
                </p>
              </div>
            </div>
          ) : reactFiles && Object.keys(reactFiles).length > 0 ? (
            <div className="w-full h-full flex flex-col" style={{ minHeight: 0, height: "100%" }}>
              <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
                <Sandpack
                  template="react"
                  theme="light"
                  options={{
                    editorHeight: "100%",
                    editorWidthPercentage: 0,
                    showNavigator: false,
                    showTabs: false,
                    showLineNumbers: false,
                    showInlineErrors: true,
                    wrapContent: true,
                    closableTabs: false,
                    readOnly: true,
                    showConsole: false,
                    showConsoleButton: false,
                  }}
                  files={reactFiles}
                  customSetup={{
                    dependencies: {
                      react: "^18.2.0",
                      "react-dom": "^18.2.0",
                      "react-router-dom": "^6.0.0",
                    },
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">
                  {t("outline.webDesign.preview.emptyState")}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {t("outline.webDesign.preview.description")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

