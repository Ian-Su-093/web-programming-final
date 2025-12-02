// API client for backend service
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-service-1076130420823.asia-east1.run.app'

// Types based on OpenAPI schema
export interface UserPreference {
    theme?: 'light' | 'dark' | 'system'
    language?: 'en' | 'zh-TW'
}

export interface UserResponseModel {
    id: string
    email: string | null
    name: string | null
    picture: string | null
    preferences: UserPreference
    created_at: string
    updated_at: string
}

export interface UserResponse {
    status: string
    user: UserResponseModel | null
}

export interface ErrorResponse {
    detail: string
}

export interface UserPreferenceRequest {
    theme: 'light' | 'dark' | 'system'
    language: 'en' | 'zh-TW'
}

// Course types based on OpenAPI schema
export interface CourseModel {
    id: string
    name: string
    owner_id: string
    created_at: string
    updated_at: string
    phase?: 'markdown' | 'website'
}

export interface MultipleCourseResponse {
    status: string
    courses: CourseModel[]
}

export interface CourseResponse {
    status: string
    course: CourseModel
}

export interface CourseDetailResponse {
    status: string
    course: CourseModel
    messages: MessageModel[]
}

export interface MessageModel {
    id: string
    index: number
    course_id: string
    role: 'user' | 'assistant' | 'tool'
    content: string | null
    toolCalls?: ToolCallModel[] | null
    toolCallId?: string | null
    toolName?: string | null
    createdAt: string
}

export interface ToolCallModel {
    type?: string
    function: ToolCallFunction
}

export interface ToolCallFunction {
    name: string
    arguments: string
}

// API client with credentials (cookies) support
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            // Unauthenticated - return null or throw specific error
            const errorData = await response.json().catch(() => ({ detail: 'Unauthorized' }))
            throw new Error(errorData.detail || 'Unauthorized')
        }

        const errorData: ErrorResponse = await response.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(errorData.detail || `Request failed with status ${response.status}`)
    }

    return response.json()
}

// Get current user information
export async function getCurrentUser(): Promise<UserResponse> {
    return apiRequest<UserResponse>('/api/v1/user/')
}

// Logout current user
export async function logout(): Promise<void> {
    await apiRequest<Record<string, never>>('/api/v1/user/logout', {
        method: 'POST',
    })
}

// Update user preferences
export async function updateUserPreference(preferences: UserPreferenceRequest): Promise<UserResponse> {
    return apiRequest<UserResponse>('/api/v1/user/preference', {
        method: 'PUT',
        body: JSON.stringify(preferences),
    })
}

// Get all courses
export async function getAllCourses(): Promise<MultipleCourseResponse> {
    return apiRequest<MultipleCourseResponse>('/api/v1/course')
}

// Get a course by ID
export async function getCourseById(courseId: string): Promise<CourseDetailResponse> {
    return apiRequest<CourseDetailResponse>(`/api/v1/course/${courseId}`)
}

// Create a new course
export async function createCourse(courseName: string, files: File[]): Promise<CourseResponse> {
    const formData = new FormData()
    formData.append('course_name', courseName)

    // Append each file to the form data
    files.forEach((file) => {
        formData.append('files', file)
    })

    const url = `${API_URL}/api/v1/course`

    console.log('createCourse', url, { courseName, fileCount: files.length })

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
    })

    if (!response.ok) {
        if (response.status === 401) {
            const errorData = await response.json().catch(() => ({ detail: 'Unauthorized' }))
            throw new Error(errorData.detail || 'Unauthorized')
        }

        const errorData: ErrorResponse = await response.json().catch(() => ({ detail: 'Request failed' }))
        throw new Error(errorData.detail || `Request failed with status ${response.status}`)
    }

    return response.json()
}