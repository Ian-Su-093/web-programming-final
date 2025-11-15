import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function TermsOfServicePage() {
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
                            Terms of Service for Course Craft
                        </h1>
                        <p className={`text-sm ${getTextColor()} transition-colors`}>
                            Effective Date: {getCurrentDate()}
                        </p>
                    </div>

                    <div className={`prose prose-lg max-w-none ${isDark ? "prose-invert" : ""} ${getTextColor()}`}>
                        <p className={`mb-6 ${getTextColor()} transition-colors`}>
                            Welcome to Course Craft!
                        </p>
                        <p className={`mb-8 ${getTextColor()} transition-colors`}>
                            These Terms of Service ("Terms") govern your use of Course Craft's website and services (collectively, "Services"), which are provided by [Company Name] ("we," "us," or "our"). By accessing or using our Services, you agree to be bound by these Terms.
                        </p>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                1. Acceptance of Terms
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                By accessing or using Course Craft, you agree to comply with and be bound by these Terms, as well as our Privacy Policy, which is incorporated by reference. If you do not agree to these Terms, you should not use our Services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                2. Services Description
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                Course Craft allows users to create course websites powered by artificial intelligence (AI). Users can upload PDF files, which the AI agent (Gemini) uses to generate a course outline. Users can interact with the agent via chat to refine the outline and build the website based on the outline. The chat history is stored in our database.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                3. Account Registration
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                To use Course Craft's services, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to keep your account information up to date.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                4. User Responsibilities
                            </h2>
                            <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                                <li>You are responsible for all content uploaded to the platform, including PDF files and chat history.</li>
                                <li>You agree not to upload any content that is illegal, harmful, defamatory, or infringes the rights of others.</li>
                                <li>You agree not to misuse the Services, including but not limited to attempting to gain unauthorized access to any systems, networks, or user accounts.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                5. Privacy and Data Collection
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                Your use of Course Craft is governed by our [Privacy Policy]. Please review it to understand how we collect, use, and protect your data.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                6. Payment Terms
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                If Course Craft offers paid services, you agree to provide accurate payment information and authorize us to charge your chosen payment method. Payments are non-refundable unless otherwise stated.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                7. Ownership and Intellectual Property
                            </h2>
                            <ul className={`list-disc list-inside mb-4 space-y-2 ${getTextColor()} transition-colors leading-relaxed ml-4`}>
                                <li>You retain ownership of any content you upload to the platform.</li>
                                <li>We retain all rights, titles, and interest in the technology and AI tools used to provide Course Craft, including but not limited to any software, algorithms, and databases.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                8. Limitation of Liability
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                We are not liable for any direct, indirect, incidental, special, or consequential damages that result from your use of the Services or any content provided by the Services. Our liability is limited to the amount paid for the specific service in the transaction that gave rise to the claim.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                9. Indemnification
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                You agree to indemnify and hold harmless Course Craft, its affiliates, and employees from any claims, losses, damages, liabilities, or expenses (including attorneys' fees) arising from your use of the Services or violation of these Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                10. Termination
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                We reserve the right to suspend or terminate your access to the Services at our sole discretion, including but not limited to any violation of these Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                11. Changes to Terms
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                We reserve the right to modify or update these Terms at any time. Any changes will be posted on this page, and the effective date will be updated accordingly. Your continued use of the Services after such changes constitutes your acceptance of the revised Terms.
                            </p>
                        </section>

                        <section className="mb-8 pt-8 border-t border-gray-300 dark:border-[#3E4451]">
                            <h2 className={`text-2xl font-semibold mb-4 ${getHeadingColor()} transition-colors`}>
                                Contact Information
                            </h2>
                            <p className={`mb-4 ${getTextColor()} transition-colors leading-relaxed`}>
                                If you have any questions about these Terms, please contact us at:
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

