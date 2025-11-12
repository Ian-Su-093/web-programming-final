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
    <div className="min-h-screen bg-black text-white">
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: `center calc(50% + ${parallaxOffset}px)`,
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-3xl border border-none bg-white/10 px-8 py-12 shadow-2xl shadow-black/40 backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Learn, Build, Grow</p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Craft courses that empower modern learners
            </h1>
            <p className="mt-6 text-lg text-white/80">
              We pair thoughtful design with AI assistance so you can shape unforgettable learning experiences.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleAboutClick}
                className="rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm font-medium text-white transition hover:bg-white/20"
              >
                About Us
              </button>
              <button
                onClick={handleGetStartedClick}
                className="group relative flex items-center justify-center overflow-hidden rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
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

      <section ref={aboutSectionRef} className="bg-black px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-6 text-center text-white/80">
          <h2
            className={`text-3xl font-semibold text-white transition-all duration-700 ${aboutVisible ? "opacity-100" : "opacity-0"
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

      <section className="bg-black px-6 pb-24">
        <div className="mx-auto max-w-6xl space-y-20">
          {steps.map((step, index) => (
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
              style={{ transitionDelay: `${index * 0.1 + 0.2}s` }}
            >
              <div
                className={`space-y-4 text-white/80 ${index % 2 === 1 ? "md:order-2 md:text-right md:[&>p]:mx-0" : ""
                  }`}
              >
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
                  {step.title}
                </span>
                <h3 className="text-3xl font-semibold text-white">{step.heading}</h3>
                <p className="text-lg leading-relaxed">{step.description}</p>
              </div>
              <div
                className={`relative h-64 w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl shadow-black/40 backdrop-blur-sm ${index % 2 === 1 ? "md:order-1" : ""
                  }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm uppercase tracking-[0.2em] text-white/70">
                    Image
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

