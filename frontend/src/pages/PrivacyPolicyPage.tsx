import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n/config"

export function PrivacyPolicyPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Get current language from i18n
  const currentLanguage = i18n.language || localStorage.getItem("language") || "en"

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
    const locale = currentLanguage === "zh-TW" ? "zh-TW" : "en-US"
    return new Date().toLocaleDateString(locale, {
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
          {t("privacyPolicy.back")}
        </button>

        <div className={`rounded-lg border ${getCardBorder()} ${getCardBg()} shadow-lg p-8 md:p-12 transition-colors`}>
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${getTitleColor()} transition-colors`}>
              {t("privacyPolicy.title")}
            </h1>
            <p className={`text-sm ${getTextColor()} transition-colors`}>
              {t("privacyPolicy.effectiveDate")}: {getCurrentDate()}
            </p>
          </div>

          <div className={`prose prose-lg max-w-none ${isDark ? "prose-invert" : ""} ${getTextColor()}`}>
            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.introduction.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.introduction.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.informationWeCollect.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.informationWeCollect.intro")}
              </p>
              <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                {(() => {
                  const accountInfo = t("privacyPolicy.sections.informationWeCollect.items.accountInfo")
                  const accountParts = accountInfo.split(/[:：]/)
                  const uploadedContent = t("privacyPolicy.sections.informationWeCollect.items.uploadedContent")
                  const uploadedParts = uploadedContent.split(/[:：]/)
                  const usageData = t("privacyPolicy.sections.informationWeCollect.items.usageData")
                  const usageParts = usageData.split(/[:：]/)
                  return (
                    <>
                      <li><strong>{accountParts[0]}{currentLanguage === "zh-TW" ? "：" : ":"}</strong> {accountParts.slice(1).join(currentLanguage === "zh-TW" ? "：" : ":").trim()}</li>
                      <li><strong>{uploadedParts[0]}{currentLanguage === "zh-TW" ? "：" : ":"}</strong> {uploadedParts.slice(1).join(currentLanguage === "zh-TW" ? "：" : ":").trim()}</li>
                      <li><strong>{usageParts[0]}{currentLanguage === "zh-TW" ? "：" : ":"}</strong> {usageParts.slice(1).join(currentLanguage === "zh-TW" ? "：" : ":").trim()}</li>
                    </>
                  )
                })()}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.howWeUse.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.howWeUse.intro")}
              </p>
              <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                {(t("privacyPolicy.sections.howWeUse.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.dataStorage.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.dataStorage.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.sharing.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.sharing.intro")}
              </p>
              <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                {(() => {
                  const serviceProviders = t("privacyPolicy.sections.sharing.items.serviceProviders")
                  const serviceParts = serviceProviders.split(/[:：]/)
                  const legalRequirements = t("privacyPolicy.sections.sharing.items.legalRequirements")
                  const legalParts = legalRequirements.split(/[:：]/)
                  return (
                    <>
                      <li><strong>{serviceParts[0]}{currentLanguage === "zh-TW" ? "：" : ":"}</strong> {serviceParts.slice(1).join(currentLanguage === "zh-TW" ? "：" : ":").trim()}</li>
                      <li><strong>{legalParts[0]}{currentLanguage === "zh-TW" ? "：" : ":"}</strong> {legalParts.slice(1).join(currentLanguage === "zh-TW" ? "：" : ":").trim()}</li>
                    </>
                  )
                })()}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.cookies.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.cookies.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.dataRetention.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.dataRetention.content", { email: "" }).split("{email}")[0]}
                <a href={`mailto:${t("privacyPolicy.sections.dataRetention.email")}`} className="text-blue-500 hover:underline">
                  {t("privacyPolicy.sections.dataRetention.email")}
                </a>
                {t("privacyPolicy.sections.dataRetention.content", { email: "" }).split("{email}")[1]}
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.yourRights.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.yourRights.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.internationalTransfers.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.internationalTransfers.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.childrenPrivacy.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.childrenPrivacy.content")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.changes.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.changes.content")}
              </p>
            </section>

            <section className="mb-8 pt-8 border-t border-gray-300 dark:border-[#3E4451]">
              <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                {t("privacyPolicy.sections.contact.title")}
              </h2>
              <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.contact.intro")}
              </p>
              <p className={`${getTextColor()} transition-colors leading-relaxed`}>
                {t("privacyPolicy.sections.contact.email", { email: "" }).split("{email}")[0]}
                <a href={`mailto:${t("privacyPolicy.sections.contact.emailValue")}`} className="text-blue-500 hover:underline">
                  {t("privacyPolicy.sections.contact.emailValue")}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
