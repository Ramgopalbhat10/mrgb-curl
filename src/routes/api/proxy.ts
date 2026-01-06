import { createFileRoute } from '@tanstack/react-router'

// API route to proxy HTTP requests server-side
// This bypasses browser CORS restrictions and exposes all headers
export const Route = createFileRoute('/api/proxy')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const startTime = performance.now()

        try {
          const body = await request.json()
          const { method, url, headers: reqHeaders, body: reqBody } = body

          // Validate URL
          if (!url || typeof url !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid URL' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          // Prepare headers
          const fetchHeaders = new Headers({
            'Content-Type': 'application/json',
            ...reqHeaders,
          })

          // Prepare fetch options
          const fetchOptions: RequestInit = {
            method: method || 'GET',
            headers: fetchHeaders,
          }

          // Add body for methods that support it
          if (reqBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
            fetchOptions.body = reqBody
          }

          // Execute request server-side (no CORS restrictions)
          const response = await fetch(url, fetchOptions)
          const endTime = performance.now()

          // Collect ALL response headers (server-side has full access)
          const responseHeaders: Record<string, string> = {}
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value
          })

          // Get response body
          const responseBody = await response.text()

          // Calculate response size
          const responseSize = new TextEncoder().encode(responseBody).length

          const result = {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: responseBody,
            responseTime: Math.round(endTime - startTime),
            size: responseSize,
          }

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      },
    },
  },
})
