import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ChevronFirst, ChevronLast, Monitor, ExternalLink } from "lucide-react"
import { Sandpack } from "@codesandbox/sandpack-react"

interface WebPreviewProps {
  onToggleChat: () => void
  onHidePreview?: () => void
  onShowChat?: () => void
  isChatHidden: boolean
  isSwapped?: boolean
  id?: string
  hasFiles?: boolean
}

export function WebPreview({ onToggleChat, onHidePreview, onShowChat, isChatHidden, isSwapped = false, id, hasFiles = false }: WebPreviewProps) {
  const { t } = useTranslation()
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
          {hasFiles ? (
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
                  files={{
                    "/App.js": `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          Welcome to Your Course Website
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280' 
        }}>
          A beautiful React application built for your course
        </p>
      </header>

      <main>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Interactive Counter
          </h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {count}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => setCount(count - 1)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Decrease
            </button>
            <button
              onClick={() => setCount(count + 1)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Increase
            </button>
            <button
              onClick={() => setCount(0)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Feature 1
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              This is a sample feature card. Your course website will have custom content here.
            </p>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Feature 2
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              Another feature card showcasing the layout and design of your website.
            </p>
          </div>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Feature 3
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              A third feature card to demonstrate the responsive grid layout.
            </p>
          </div>
        </div>

        <footer style={{
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '2px solid #e5e7eb',
          color: '#6b7280'
        }}>
          <p>Built with React • Course Website Preview</p>
        </footer>
      </main>
    </div>
  );
}

export default App;`,
                    "/index.js": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
                    "/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Course Website</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
                    "/package.json": `{
  "name": "course-website",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
                  }}
                  customSetup={{
                    dependencies: {
                      react: "^18.2.0",
                      "react-dom": "^18.2.0",
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

