import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getCourseById } from "@/lib/api"

export function CourseUploadRedirectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    const redirectBasedOnPhase = async () => {
      if (!id) {
        navigate("/user/dashboard", { replace: true })
        return
      }

      try {
        const response = await getCourseById(id)
        const phase = response.course.phase

        if (phase === "markdown") {
          navigate(`/${id}/outline`, { replace: true })
        } else if (phase === "website") {
          navigate(`/${id}/web-design`, { replace: true })
        } else {
          // Course exists but phase is undefined or invalid, redirect to dashboard
          navigate("/user/dashboard", { replace: true })
        }
      } catch (error) {
        // Course doesn't exist or error fetching, redirect to dashboard
        console.error("Failed to fetch course:", error)
        navigate("/user/dashboard", { replace: true })
      }
    }

    redirectBasedOnPhase()
  }, [id, navigate])

  // Show loading state while redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-[#21252B]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#61AFEF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#ABB2BF] text-sm">Redirecting...</p>
      </div>
    </div>
  )
}

