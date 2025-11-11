import { z } from "zod"

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.date(),
})

export type Message = z.infer<typeof MessageSchema>

export const CourseOutlineItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  duration: z.string().optional(),
  week: z.number().optional(),
  topics: z.array(z.string()).optional(),
})

export type CourseOutlineItem = z.infer<typeof CourseOutlineItemSchema>

export const CourseDataSchema = z.object({
  title: z.string(),
  outline: z.array(CourseOutlineItemSchema),
})

export type CourseData = z.infer<typeof CourseDataSchema>

