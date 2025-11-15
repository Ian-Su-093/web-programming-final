import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

export function HomePage() {
  const navigate = useNavigate()
  const aboutSectionRef = useRef<HTMLDivElement | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const [aboutVisible, setAboutVisible] = useState(false)

  const steps = [
    {
      title: "Create",
      heading: "Start with a bold course concept",
      description:
        "Spin up a new project in minutes and capture the heart of your course. Set goals, define outcomes, and establish the learner journey you want to deliver.",
    },
    {
      title: "Upload",
      heading: "Bring your course materials together",
      description:
        "Drag-and-drop syllabi, slide decks, and readings. Our AI models digest every file so the platform understands your voice, your content, and your priorities.",
    },
    {
      title: "Plan",
      heading: "Shape the perfect outline",
      description:
        "Review the auto-generated course structure, then tailor sequences, add supporting activities, and align assessments to your desired competencies.",
    },
    {
      title: "Design",
      heading: "Launch a polished course site",
      description:
        "Transform the outline into an immersive webpage. Customize layouts, embed media, and fine-tune the narrative before sharing it with learners.",
    },
  ]

  const [stepVisibility, setStepVisibility] = useState(() => steps.map(() => false))

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.scrollY * 0.2)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === aboutSectionRef.current && entry.isIntersecting) {
            setAboutVisible(true)
            observer.unobserve(entry.target)
            return
          }

          const stepIndex = stepRefs.current.findIndex((ref) => ref === entry.target)

          if (stepIndex !== -1 && entry.isIntersecting) {
            setStepVisibility((prev) => {
              if (prev[stepIndex]) return prev
              const next = [...prev]
              next[stepIndex] = true
              return next
            })
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )

    if (aboutSectionRef.current) {
      observer.observe(aboutSectionRef.current)
    }

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [steps.length])

  const handleAboutClick = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleGetStartedClick = () => {
    navigate("/user/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: `center calc(50% + ${parallaxOffset}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 via-white/10 to-white/5 px-8 py-12 shadow-2xl shadow-blue-500/20 backdrop-blur-md">
            <div className="mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Course Craft
              </h2>
            </div>
            <p className="text-sm uppercase tracking-[0.4em] text-blue-400">Learn, Build, Grow</p>
            <h1 className="mt-6 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-5xl font-semibold leading-tight text-transparent sm:text-6xl">
              Craft courses that empower modern learners
            </h1>
            <p className="mt-6 text-lg text-white/90">
              We pair thoughtful design with AI assistance so you can shape unforgettable learning experiences.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleAboutClick}
                className="rounded-full border border-white/40 bg-gradient-to-r from-white/10 to-white/5 px-8 py-3 text-sm font-medium text-white transition hover:from-white/20 hover:to-white/10 hover:border-white/60"
              >
                About Us
              </button>
              <button
                onClick={handleGetStartedClick}
                className="group relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/50"
              >
                <span className="relative flex items-center gap-2 transition-transform duration-200 group-hover:-translate-x-2">
                  Get Started
                </span>
                <span className="absolute right-6 flex items-center opacity-0 transition-all duration-200 group-hover:right-5 group-hover:opacity-100">
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
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section ref={aboutSectionRef} className="relative bg-gradient-to-b from-black via-slate-900 to-black px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative mx-auto max-w-4xl space-y-6 text-center text-white/80">
          <h2
            className={`bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-3xl font-semibold text-transparent transition-all duration-700 ${aboutVisible ? "opacity-100" : "opacity-0"
              }`}
          >
            Who We Are
          </h2>
          <p
            className={`text-lg leading-relaxed transition-all duration-700 ${aboutVisible ? "opacity-100 delay-150" : "translate-y-6 opacity-0"
              }`}
          >
            We&apos;re a collective of educators, technologists, and creators committed to building smarter learning journeys.
            Our platform combines empathetic storytelling, data insights, and AI-powered tooling so you can launch adaptive
            curriculum faster—and keep it resonating with every learner you serve.
          </p>
          <p
            className={`text-lg leading-relaxed transition-all duration-700 ${aboutVisible ? "opacity-100 delay-300" : "translate-y-6 opacity-0"
              }`}
          >
            From first sketch to final delivery, we help you stay focused on your mission: unlocking possibility through
            education. Let&apos;s co-create a course experience that feels alive, accessible, and unmistakably yours.
          </p>
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-black via-slate-900 to-black px-6 pb-24 pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative mx-auto max-w-6xl space-y-20">
          {steps.map((step, index) => {
            const colors = [
              { gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", accent: "text-blue-400" },
              { gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", accent: "text-purple-400" },
              { gradient: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/30", accent: "text-cyan-400" },
              { gradient: "from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30", accent: "text-indigo-400" },
            ]
            const colorScheme = colors[index % colors.length]

            return (
              <div
                key={step.title}
                ref={(el) => {
                  stepRefs.current[index] = el
                }}
                className={`grid items-center gap-12 transition-all duration-700 md:grid-cols-2 ${stepVisibility[index]
                  ? "translate-x-0 opacity-100"
                  : index % 2 === 0
                    ? "-translate-x-16 opacity-0"
                    : "translate-x-16 opacity-0"
                  }`}
                style={{ transitionDelay: `0.2s` }}
              >
                <div
                  className={`space-y-4 text-white/90 ${index % 2 === 1 ? "md:order-2" : ""
                    }`}
                >
                  <span className={`text-sm font-semibold uppercase tracking-[0.3em] ${colorScheme.accent}`}>
                    {step.title}
                  </span>
                  <h3 className="text-3xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{step.heading}</h3>
                  <p className="text-lg leading-relaxed text-white/80">{step.description}</p>
                </div>
                <div
                  className={`relative h-64 w-full overflow-hidden rounded-3xl border ${colorScheme.border} bg-gradient-to-br ${colorScheme.gradient} shadow-2xl shadow-black/60 backdrop-blur-sm ${index % 2 === 1 ? "md:order-1" : ""
                    }`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`flex h-32 w-32 items-center justify-center rounded-full border ${colorScheme.border} bg-gradient-to-br ${colorScheme.gradient} text-sm uppercase tracking-[0.2em] text-white/80 shadow-lg`}>
                      Image
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="flex justify-center pt-8">
            <button
              onClick={handleGetStartedClick}
              className="group relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/50"
            >
              <span className="relative flex items-center gap-2 transition-transform duration-200 group-hover:-translate-x-2">
                Try Now
              </span>
              <span className="absolute right-6 flex items-center opacity-0 transition-all duration-200 group-hover:right-5 group-hover:opacity-100">
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
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

