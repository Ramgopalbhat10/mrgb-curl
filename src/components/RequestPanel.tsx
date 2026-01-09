import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Header, QueryParam, RequestBody, HttpMethod } from '@/schemas'
import { HeadersEditor } from './HeadersEditor'
import { ParamsEditor } from './ParamsEditor'
import { BodyEditor } from './BodyEditor'
import { AuthEditor, AuthConfig } from './AuthEditor'
import { parseUrlParams } from '@/lib/queryParams'

type RequestTab = 'params' | 'headers' | 'auth' | 'body'

interface RequestPanelProps {
  url: string
  method: HttpMethod
  headers: Header[]
  params: QueryParam[]
  body: RequestBody | null
  auth: AuthConfig
  onUrlChange: (url: string) => void
  onHeadersChange: (headers: Header[]) => void
  onParamsChange: (params: QueryParam[]) => void
  onBodyChange: (body: RequestBody | null) => void
  onAuthChange: (auth: AuthConfig) => void
  error?: string | null
  className?: string
  style?: React.CSSProperties
}

const areParamsEqual = (left: QueryParam[], right: QueryParam[]) => {
  if (left.length !== right.length) return false
  return left.every(
    (param, index) =>
      param.key === right[index]?.key && param.value === right[index]?.value,
  )
}

export function RequestPanel({
  url,
  method,
  headers,
  params,
  body,
  auth,
  onUrlChange,
  onHeadersChange,
  onParamsChange,
  onBodyChange,
  onAuthChange,
  error,
  className,
  style,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>('params')
  const lastSyncedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastSyncedUrlRef.current === url) return
    lastSyncedUrlRef.current = url

    const parsedParams = parseUrlParams(url)
    const enabledParams = params.filter((param) => param.enabled)
    if (areParamsEqual(parsedParams, enabledParams)) return

    const disabledParams = params.filter(
      (param) =>
        !param.enabled &&
        !parsedParams.some((parsed) => parsed.key === param.key),
    )

    onParamsChange([...parsedParams, ...disabledParams])
  }, [url, params, onParamsChange])

  const tabs: { id: RequestTab; label: string; count?: number }[] = [
    {
      id: 'params',
      label: 'Params',
      count: params.filter((p) => p.enabled).length,
    },
    { id: 'headers', label: 'Headers', count: headers.length },
    { id: 'auth', label: 'Auth' },
    { id: 'body', label: 'Body' },
  ]

  return (
    <div className={cn('flex flex-col bg-background', className)} style={style}>
      {/* Request Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-1 text-sm font-medium rounded-sm transition-colors',
              activeTab === tab.id
                ? 'text-foreground bg-muted/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-xs text-primary">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'params' && (
          <ParamsEditor
            params={params}
            url={url}
            onChange={onParamsChange}
            onUrlChange={onUrlChange}
          />
        )}

        {activeTab === 'headers' && (
          <HeadersEditor headers={headers} onChange={onHeadersChange} />
        )}

        {activeTab === 'auth' && (
          <AuthEditor auth={auth} onChange={onAuthChange} />
        )}

        {activeTab === 'body' && (
          <BodyEditor body={body} method={method} onChange={onBodyChange} />
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            <kbd className="rounded border border-border bg-muted/50 px-1 py-0.5 text-[10px] font-mono">
              Ctrl
            </kbd>
            {' + '}
            <kbd className="rounded border border-border bg-muted/50 px-1 py-0.5 text-[10px] font-mono">
              Enter
            </kbd>
            {' to send'}
          </span>
        </div>
        <span>{body?.type || 'None'}</span>
      </div>
    </div>
  )
}
