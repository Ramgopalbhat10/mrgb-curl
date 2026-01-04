import { z } from 'zod'

// HTTP Methods enum
export const HttpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
])

// Request/Response header schema
export const HeaderSchema = z.object({
  key: z.string().min(1, 'Header key cannot be empty'),
  value: z.string(),
})

// Query parameter schema
export const QueryParamSchema = z.object({
  key: z.string().min(1, 'Parameter key cannot be empty'),
  value: z.string(),
  enabled: z.boolean().default(true),
})

// Request body schema
export const RequestBodySchema = z.object({
  type: z.enum(['json', 'text', 'form-data', 'x-www-form-urlencoded']),
  content: z.string(),
})

// HTTP Request schema
export const HttpRequestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Request name cannot be empty'),
  method: HttpMethodSchema,
  url: z.string().url('Invalid URL format'),
  headers: z.array(HeaderSchema),
  params: z.array(QueryParamSchema),
  body: RequestBodySchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// HTTP Response schema
export const HttpResponseSchema = z.object({
  status: z.number().int().min(100).max(599),
  statusText: z.string(),
  headers: z.array(HeaderSchema),
  body: z.string(),
  responseTime: z.number().nonnegative(),
  size: z.number().nonnegative(),
  timestamp: z.date(),
})

// Collection schema
export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Collection name cannot be empty'),
  description: z.string().optional(),
  requests: z.array(z.string()), // Array of request IDs
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Request history entry schema
export const RequestHistorySchema = z.object({
  id: z.string(),
  requestId: z.string(),
  request: HttpRequestSchema,
  response: HttpResponseSchema,
  timestamp: z.date(),
})

// Request tab schema
export const RequestTabSchema = z.object({
  id: z.string(),
  name: z.string(),
  requestId: z.string().optional(), // null for unsaved requests
  isDirty: z.boolean().default(false),
  isActive: z.boolean().default(false),
})

// Application state schema
export const AppStateSchema = z.object({
  collections: z.array(CollectionSchema),
  requests: z.array(HttpRequestSchema),
  history: z.array(RequestHistorySchema),
  tabs: z.array(RequestTabSchema),
  activeTabId: z.string().optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    autoSave: z.boolean().default(true),
    followRedirects: z.boolean().default(true),
    validateSSL: z.boolean().default(true),
  }),
})

// Export types
export type HttpMethod = z.infer<typeof HttpMethodSchema>
export type Header = z.infer<typeof HeaderSchema>
export type QueryParam = z.infer<typeof QueryParamSchema>
export type RequestBody = z.infer<typeof RequestBodySchema>
export type HttpRequest = z.infer<typeof HttpRequestSchema>
export type HttpResponse = z.infer<typeof HttpResponseSchema>
export type Collection = z.infer<typeof CollectionSchema>
export type RequestHistory = z.infer<typeof RequestHistorySchema>
export type RequestTab = z.infer<typeof RequestTabSchema>
export type AppState = z.infer<typeof AppStateSchema>
