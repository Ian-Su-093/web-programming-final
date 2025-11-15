import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import i18n from "@/i18n/config"

export function TermsOfServicePage() {
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
                    {t("termsOfService.back")}
                </button>

                <div className={`rounded-lg border ${getCardBorder()} ${getCardBg()} shadow-lg p-8 md:p-12 transition-colors`}>
                    <div className="mb-8">
                        <h1 className={`text-4xl font-bold mb-2 ${getTitleColor()} transition-colors`}>
                            {t("termsOfService.title")}
                        </h1>
                        <p className={`text-sm ${getTextColor()} transition-colors`}>
                            {t("termsOfService.effectiveDate")}: {getCurrentDate()}
                        </p>
                    </div>

                    <div className={`prose prose-lg max-w-none ${isDark ? "prose-invert" : ""} ${getTextColor()}`}>
                        <p className={`mb-6 ${getTextColor()} transition-colors`}>
                            {t("termsOfService.sections.introduction.welcome")}
                        </p>
                        <p className={`mb-8 ${getTextColor()} transition-colors`}>
                            {t("termsOfService.sections.introduction.content")}
                        </p>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.acceptance.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.acceptance.content")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.servicesDescription.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.servicesDescription.content")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.accountRegistration.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.accountRegistration.content")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.userResponsibilities.title")}
                            </h2>
                            <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                                {(t("termsOfService.sections.userResponsibilities.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.privacy.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.privacy.content", { privacyPolicy: t("termsOfService.sections.privacy.privacyPolicy") })}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.paymentTerms.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.paymentTerms.content")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.ownership.title")}
                            </h2>
                            <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                                {(t("termsOfService.sections.ownership.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.limitationOfLiability.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.limitationOfLiability.content")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.indemnification.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.indemnification.content")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.termination.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.termination.content")}
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.changesToTerms.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.changesToTerms.content")}
                            </p>
                        </section>

                        <section className="mb-8 pt-8 border-t border-gray-300 dark:border-[#3E4451]">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                {t("termsOfService.sections.contact.title")}
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                {t("termsOfService.sections.contact.content")}
                            </p>
                            <p className={`${getTextColor()} transition-colors leading-relaxed`}>
                                Email: <a href={`mailto:${t("termsOfService.sections.contact.email")}`} className="text-blue-500 hover:underline">{t("termsOfService.sections.contact.email")}</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

