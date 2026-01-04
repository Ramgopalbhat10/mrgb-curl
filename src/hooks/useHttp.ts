import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { HttpResponse } from '@/schemas'

// HTTP method type
const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const
type HttpMethod = typeof httpMethods[number]

// Request execution schema for validation
const RequestExecutionSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  url: z.string().url(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
})

// Response validation schema
const ResponseValidationSchema = z.object({
  status: z.number().int().min(100).max(599),
  statusText: z.string(),
  headers: z.record(z.string(), z.string()),
  body: z.string(),
})

// HTTP request execution function
async function executeHttpRequest(request: z.infer<typeof RequestExecutionSchema>): Promise<HttpResponse> {
  const startTime = performance.now()
  
  try {
    // Validate request before execution
    const validatedRequest = RequestExecutionSchema.parse(request)
    
    // Prepare headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...validatedRequest.headers,
    })

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: validatedRequest.method,
      headers,
    }

    // Add body for methods that support it
    if (validatedRequest.body && ['POST', 'PUT', 'PATCH'].includes(validatedRequest.method)) {
      fetchOptions.body = validatedRequest.body
    }

    // Execute request
    const response = await fetch(validatedRequest.url, fetchOptions)
    const endTime = performance.now()
    
    // Get response headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Get response body
    const responseText = await response.text()
    
    // Calculate response size
    const responseSize = new Blob([responseText]).size

    // Create response object
    const httpResponse: HttpResponse = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.entries(responseHeaders).map(([key, value]) => ({ key, value })),
      body: responseText,
      responseTime: Math.round(endTime - startTime),
      size: responseSize,
      timestamp: new Date(),
    }

    // Validate response
    ResponseValidationSchema.parse({
      status: httpResponse.status,
      statusText: httpResponse.statusText,
      headers: responseHeaders,
      body: responseText,
    })

    return httpResponse
  } catch (error) {
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues.map(i => i.message).join(', ')}`)
    }
    
    if (error instanceof TypeError) {
      // Network errors, CORS, etc.
      throw new Error(`Network error: ${error.message}`)
    }
    
    // Generic error
    throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// HTTP hook for making requests
export function useHttp() {
  const queryClient = useQueryClient()

  const sendRequest = useMutation({
    mutationFn: executeHttpRequest,
    onSuccess: (response, variables) => {
      // Cache the response
      queryClient.setQueryData(['response', variables.url, variables.method], response)
      
      // Invalidate any existing queries for this endpoint
      queryClient.invalidateQueries({ 
        queryKey: ['requests', variables.url] 
      })
    },
    onError: (error) => {
      console.error('HTTP request failed:', error)
    },
  })

  return {
    sendRequest,
    isLoading: sendRequest.isPending,
    error: sendRequest.error,
    data: sendRequest.data,
    reset: sendRequest.reset,
  }
}

// Hook for getting cached response
export function useCachedResponse(url: string, method: HttpMethod) {
  return useQueryClient().getQueryData<HttpResponse>(['response', url, method])
}

// Hook for invalidating cached responses
export function useInvalidateResponses() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['response'] })
  }
}
