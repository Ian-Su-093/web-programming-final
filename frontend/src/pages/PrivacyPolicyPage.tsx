import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function PrivacyPolicyPage() {
  const navigate = useNavigate()
  
  // Theme state - default to system to respect system preferences
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    return savedTheme || "system"
  })

  // Track effective theme (light or dark) for reactive styling
  const [isDark, setIsDark] = useState(() => {
    if (theme === "light") return false
    if (theme === "dark") return true
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Apply theme on mount and when theme changes
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove("dark", "theme-light")
    
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(systemPrefersDark)
      document.documentElement.classList.toggle("dark", systemPrefersDark)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches)
        document.documentElement.classList.remove("theme-light")
        document.documentElement.classList.toggle("dark", e.matches)
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else if (theme === "light") {
      setIsDark(false)
      document.documentElement.classList.add("theme-light")
    } else {
      setIsDark(true)
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
    return isDark ? "bg-[#21252B]" : "bg-gray-50"
  }

  const getCardBg = () => {
    return isDark ? "bg-[#282C34]" : "bg-white"
  }

  const getCardBorder = () => {
    return isDark ? "border-[#3E4451]" : "border-gray-200"
  }

  const getTitleColor = () => {
    return "text-white"
  }

  const getTextColor = () => {
    return isDark ? "text-[#ABB2BF]" : "text-gray-800"
  }

  const getHeadingColor = () => {
    return "text-white"
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })
  }

  return (
    <div className={`min-h-screen ${getBgColor()} transition-colors`}>
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <button
          onClick={() => navigate(-1)}
          className={`mb-8 flex items-center gap-2 text-sm ${getTextColor()} hover:opacity-80 transition-opacity`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back
        </button>

        <div className={`rounded-lg border ${getCardBorder()} ${getCardBg()} shadow-lg p-8 md:p-12 transition-colors`}>
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${getTitleColor()} transition-colors`}>
              Privacy Policy for Course Craft
            </h1>
            <p className={`text-sm ${getTextColor()} transition-colors`}>
              Effective Date: {getCurrentDate()}
            </p>
          </div>

          <div className={`prose prose-lg max-w-none ${isDark ? "prose-invert" : ""} ${getTextColor()}`}>
            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                Introduction
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                Course Craft ("we," "us," or "our") values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you use our website and services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                1. Information We Collect
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                We collect the following types of information when you use Course Craft:
              </p>
              <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, and other details necessary for account management.</li>
                <li><strong>Uploaded Content:</strong> We collect any files or content you upload, including PDFs and any chat history generated during your interactions with the Gemini AI agent.</li>
                <li><strong>Usage Data:</strong> We collect information about how you interact with Course Craft, such as pages visited, features used, and timestamps.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                2. How We Use Your Information
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                We use the collected information to:
              </p>
              <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                <li>Provide and improve the Services.</li>
                <li>Communicate with you about your account or any updates to our services.</li>
                <li>Personalize your experience with Course Craft.</li>
                <li>Process payments and manage billing (if applicable).</li>
                <li>Comply with legal obligations and resolve disputes.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                3. Data Storage and Security
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                Your information is stored on secure servers. We implement industry-standard security measures to protect your data, but please note that no data transmission over the internet can be guaranteed to be 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                4. Sharing Your Information
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                We do not share your personal information with third parties except in the following cases:
              </p>
              <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                <li><strong>Service Providers:</strong> We may share your data with trusted third-party service providers who assist us in operating the Services, such as hosting providers and payment processors.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or in response to legal processes such as subpoenas or court orders.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                5. Cookies and Tracking Technologies
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                We use cookies and similar tracking technologies to enhance your experience on Course Craft. Cookies help us remember your preferences, analyze usage patterns, and improve our Services. You can control cookie settings through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                6. Data Retention
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                We retain your information for as long as necessary to provide the Services and comply with legal obligations. If you wish to delete your account or any personal information, please contact us at <a href="mailto:example@email.com" className="text-blue-500 hover:underline">example@email.com</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                7. Your Rights
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                Depending on your jurisdiction, you may have the right to access, update, or delete your personal data. You may also have the right to object to certain processing activities or withdraw consent where applicable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                8. International Transfers
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                Your information may be transferred to and stored on servers located outside your country of residence. By using the Services, you consent to this transfer.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                9. Children's Privacy
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                Course Craft is not intended for use by children under the age of 13. We do not knowingly collect or solicit personal information from anyone under 13 years of age. If we learn that we have inadvertently collected such information, we will take steps to delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                10. Changes to This Privacy Policy
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                We may update this Privacy Policy from time to time. When we make significant changes, we will post the updated policy on this page and update the effective date. Please review this policy periodically for any updates.
              </p>
            </section>

            <section className="mb-8 pt-8 border-t border-gray-300 dark:border-[#3E4451]">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                11. Contact Us
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                If you have any questions about this Privacy Policy or your data, please contact us at:
              </p>
              <p className={`${getTextColor()} transition-colors leading-relaxed`}>
                Email: <a href="mailto:example@email.com" className="text-blue-500 hover:underline">example@email.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

