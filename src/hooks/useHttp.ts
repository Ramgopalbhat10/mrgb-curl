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

// HTTP request execution function using server proxy API route
async function executeHttpRequest(request: z.infer<typeof RequestExecutionSchema>): Promise<HttpResponse> {
  // Validate request before execution
  const validatedRequest = RequestExecutionSchema.parse(request)

  // Call server-side API route to proxy the request
  // This bypasses browser CORS restrictions and exposes all headers
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedRequest),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Request failed with status ${response.status}`)
  }

  const proxyResponse = await response.json()

  // Convert to HttpResponse format
  const httpResponse: HttpResponse = {
    status: proxyResponse.status,
    statusText: proxyResponse.statusText,
    headers: Object.entries(proxyResponse.headers as Record<string, string>).map(([key, value]) => ({ key, value })),
    body: proxyResponse.body,
    responseTime: proxyResponse.responseTime,
    size: proxyResponse.size,
    timestamp: new Date(),
  }

  return httpResponse
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
