import { useState } from 'react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { HttpMethod } from '@/schemas'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// URL validation schema
const urlSchema = z.string().url('Invalid URL format').refine(
  (url) => {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  },
  'URL must use HTTP or HTTPS protocol'
)

interface UrlInputProps {
  value: string
  method: HttpMethod
  onUrlChange: (url: string) => void
  onMethodChange: (method: HttpMethod) => void
  className?: string
}

const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export function UrlInput({ 
  value, 
  method, 
  onUrlChange, 
  onMethodChange, 
  className 
}: UrlInputProps) {
  const [urlError, setUrlError] = useState<string>('')
  const [touched, setTouched] = useState(false)

  const validateUrl = (url: string) => {
    if (!url && !touched) {
      setUrlError('')
      return
    }

    const result = urlSchema.safeParse(url)
    if (result.success) {
      setUrlError('')
    } else {
      setUrlError(result.error.issues[0].message)
    }
  }

  const handleUrlChange = (newUrl: string) => {
    onUrlChange(newUrl)
    if (touched) {
      validateUrl(newUrl)
    }
  }

  const handleUrlBlur = () => {
    setTouched(true)
    validateUrl(value)
  }

  const getMethodColor = (method: HttpMethod) => {
    const colors = {
      GET: 'text-green-600 dark:text-green-400',
      POST: 'text-blue-600 dark:text-blue-400', 
      PUT: 'text-orange-600 dark:text-orange-400',
      PATCH: 'text-purple-600 dark:text-purple-400',
      DELETE: 'text-red-600 dark:text-red-400',
      HEAD: 'text-gray-600 dark:text-gray-400',
      OPTIONS: 'text-gray-600 dark:text-gray-400'
    }
    return colors[method] || 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="url-input" className="text-sm font-medium">
        URL
      </Label>
      
      <div className="flex gap-2">
        {/* HTTP Method Selector */}
        <Select value={method} onValueChange={(value) => value && onMethodChange(value)}>
          <SelectTrigger className={cn(
            "w-32 font-semibold",
            getMethodColor(method)
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {httpMethods.map((method) => (
              <SelectItem 
                key={method} 
                value={method}
                className={cn(
                  "font-semibold",
                  getMethodColor(method)
                )}
              >
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* URL Input */}
        <div className="flex-1 relative">
          <Input
            id="url-input"
            type="url"
            placeholder="https://api.example.com/endpoint"
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            onBlur={handleUrlBlur}
            className={cn(
              "font-mono text-sm",
              urlError && "border-red-500 focus:border-red-500"
            )}
          />
          
          {/* URL Error Message */}
          {urlError && touched && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
              {urlError}
            </div>
          )}
        </div>
      </div>
      
      {/* URL Validation Hint */}
      {!value && !touched && (
        <div className="text-xs text-muted-foreground">
          Enter a complete URL including protocol (http:// or https://)
        </div>
      )}
    </div>
  )
}
