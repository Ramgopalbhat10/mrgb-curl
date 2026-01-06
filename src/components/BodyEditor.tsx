import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RequestBody, HttpMethod } from '@/schemas'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface BodyEditorProps {
    body: RequestBody | null
    method: HttpMethod
    onChange: (body: RequestBody | null) => void
    className?: string
}

type BodyType = 'none' | 'json' | 'text' | 'form-data' | 'x-www-form-urlencoded'

const BODY_TYPES: { value: BodyType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'json', label: 'JSON' },
    { value: 'text', label: 'Raw Text' },
    { value: 'form-data', label: 'Form Data' },
    { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
]

// Methods that don't support body
const NO_BODY_METHODS: HttpMethod[] = ['GET', 'HEAD', 'OPTIONS']

export function BodyEditor({ body, method, onChange, className }: BodyEditorProps) {
    const [jsonError, setJsonError] = useState<string | null>(null)

    const bodyType: BodyType = body?.type || 'none'
    const content = body?.content || ''

    const isBodyDisabled = NO_BODY_METHODS.includes(method)

    const handleTypeChange = (newType: BodyType) => {
        if (newType === 'none') {
            onChange(null)
        } else {
            onChange({
                type: newType as RequestBody['type'],
                content: content || (newType === 'json' ? '{\n  \n}' : ''),
            })
        }
        setJsonError(null)
    }

    const handleContentChange = (newContent: string) => {
        if (bodyType === 'none') return

        onChange({
            type: bodyType as RequestBody['type'],
            content: newContent,
        })

        // Validate JSON
        if (bodyType === 'json') {
            try {
                if (newContent.trim()) {
                    JSON.parse(newContent)
                }
                setJsonError(null)
            } catch (e) {
                setJsonError('Invalid JSON format')
            }
        }
    }

    const formatJson = () => {
        if (bodyType !== 'json' || !content.trim()) return

        try {
            const parsed = JSON.parse(content)
            const formatted = JSON.stringify(parsed, null, 2)
            onChange({
                type: 'json',
                content: formatted,
            })
            setJsonError(null)
        } catch (e) {
            setJsonError('Cannot format: Invalid JSON')
        }
    }

    if (isBodyDisabled) {
        return (
            <div className={cn("flex items-center justify-center py-8", className)}>
                <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                        {method} requests don't have a body
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("space-y-3", className)}>
            {/* Body type selector */}
            <div className="flex items-center gap-3">
                <Select value={bodyType} onValueChange={(val) => val && handleTypeChange(val as BodyType)}>
                    <SelectTrigger className="w-48 h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BODY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {bodyType === 'json' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={formatJson}
                        className="h-9 text-xs"
                    >
                        Format JSON
                    </Button>
                )}
            </div>

            {/* Body content */}
            {bodyType !== 'none' && (
                <>
                    <Textarea
                        placeholder={
                            bodyType === 'json'
                                ? '{\n  "key": "value"\n}'
                                : 'Enter request body...'
                        }
                        value={content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className={cn(
                            "min-h-[200px] font-mono text-sm resize-y",
                            jsonError && "border-destructive focus-visible:ring-destructive"
                        )}
                    />

                    {jsonError && (
                        <div className="text-xs text-destructive">{jsonError}</div>
                    )}
                </>
            )}

            {bodyType === 'none' && (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    Select a body type to add request body
                </div>
            )}
        </div>
    )
}
