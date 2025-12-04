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

export interface MultipleMessageResponse {
    status: string
    messages: MessageModel[]
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

// Get messages by course ID
export async function getMessagesByCourseId(courseId: string): Promise<MultipleMessageResponse> {
    return apiRequest<MultipleMessageResponse>(`/api/v1/course/${courseId}/message`)
}

// Helper function to convert MessageModel to Message type (for frontend components)
// Returns null if the message should be filtered out (non-user/assistant messages without content, or assistant messages with toolCalls)
export function convertMessageModelToMessage(messageModel: MessageModel): { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date } | null {
    // Convert tool messages to assistant messages with a special marker for "processing"
    // The ChatSection component will detect this marker and display the translated "processing" text
    // Tool messages are always displayed, even if they have null content
    if (messageModel.role === 'tool') {
        return {
            id: messageModel.id,
            role: 'assistant', // Treat tool messages as assistant messages
            content: '__TOOL_PROCESSING__', // Special marker that will be replaced with translated text in ChatSection
            timestamp: new Date(messageModel.createdAt),
        }
    }

    // Filter out assistant messages with toolCalls (these are tool call requests, not actual content)
    if (messageModel.role === 'assistant' && messageModel.toolCalls && messageModel.toolCalls.length > 0) {
        return null
    }

    // Only include user or assistant messages
    if (messageModel.role !== 'user' && messageModel.role !== 'assistant') {
        return null
    }

    // Filter out messages with null content (except tool messages which are handled above)
    if (messageModel.content === null || messageModel.content === undefined) {
        return null
    }

    return {
        id: messageModel.id,
        role: messageModel.role as 'user' | 'assistant',
        content: messageModel.content,
        timestamp: new Date(messageModel.createdAt),
    }
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

// Create a new message by user
export interface CreateMessageRequest {
    content: string
}

export interface SingleMessageResponse {
    status: string
    message: MessageModel
}

export async function createMessage(courseId: string, content: string): Promise<SingleMessageResponse> {
    return apiRequest<SingleMessageResponse>(`/api/v1/course/${courseId}/message`, {
        method: 'POST',
        body: JSON.stringify({ content } as CreateMessageRequest),
    })
}

// Markdown file types based on OpenAPI schema
export interface CourseMarkdownFilesResponse {
    status: string
    markdown_name_list: string[]
}

export interface CourseMarkdownFileContentResponse {
    status: string
    content: string
}

// Get all markdown files in a course
export async function getCourseMarkdownFiles(courseId: string): Promise<CourseMarkdownFilesResponse> {
    return apiRequest<CourseMarkdownFilesResponse>(`/api/v1/course/${courseId}/files/markdown`)
}

// Get markdown file content in a course
export async function getCourseMarkdownFileContent(courseId: string, path: string): Promise<CourseMarkdownFileContentResponse> {
    return apiRequest<CourseMarkdownFileContentResponse>(`/api/v1/course/${courseId}/files/markdown/content?path=${encodeURIComponent(path)}`)
}