import { Plus, Trash2 } from 'lucide-react'
import type { QueryParam } from '@/schemas'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { buildUrlWithParams } from '@/lib/queryParams'

interface ParamsEditorProps {
  params: Array<QueryParam>
  url: string
  onChange: (params: Array<QueryParam>) => void
  onUrlChange?: (url: string) => void
  className?: string
}

export function ParamsEditor({
  params,
  url,
  onChange,
  onUrlChange,
  className,
}: ParamsEditorProps) {
  const addParam = () => {
    onChange([...params, { key: '', value: '', enabled: true }])
  }

  const updateParam = (
    index: number,
    field: keyof QueryParam,
    newValue: string | boolean,
  ) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], [field]: newValue }
    onChange(newParams)

    // Sync with URL
    if (onUrlChange) {
      const newUrl = buildUrlWithParams(url, newParams)
      onUrlChange(newUrl)
    }
  }

  const removeParam = (index: number) => {
    const newParams = params.filter((_, i) => i !== index)
    onChange(newParams)

    // Sync with URL
    if (onUrlChange) {
      const newUrl = buildUrlWithParams(url, newParams)
      onUrlChange(newUrl)
    }
  }

  const toggleParam = (index: number) => {
    updateParam(index, 'enabled', !params[index].enabled)
  }

  return (
    <div className={cn('', className)}>
      {/* Parameter rows */}
      <div className="">
        {params.map((param, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Checkbox
              checked={param.enabled}
              onCheckedChange={() => toggleParam(index)}
              className="h-4 w-4"
            />
            <Input
              placeholder="Parameter name"
              value={param.key}
              onChange={(e) => updateParam(index, 'key', e.target.value)}
              className={cn(
                'flex-1 font-mono text-xs h-8 border-0',
                !param.enabled && 'opacity-50',
              )}
              disabled={!param.enabled}
            />
            <Input
              placeholder="Value"
              value={param.value}
              onChange={(e) => updateParam(index, 'value', e.target.value)}
              className={cn(
                'flex-1 font-mono text-xs h-8 border-0',
                !param.enabled && 'opacity-50',
              )}
              disabled={!param.enabled}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeParam(index)}
              className="p-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add parameter button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addParam}
        className="h-6 text-xs"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Parameter
      </Button>

      {params.length === 0 && (
        <div className="text-sm text-muted-foreground py-4 text-center">
          No query parameters. Click "Add Parameter" to add one.
        </div>
      )}
    </div>
  )
}
