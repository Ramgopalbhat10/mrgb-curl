import { JsonView, allExpanded, collapseAllNested, darkStyles, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

interface JsonViewerProps {
	data: unknown
	className?: string
	collapsed?: boolean | number
}

export interface JsonViewerRef {
	expandAll: () => void
	collapseAll: () => void
}

// Custom dark styles
const customDarkStyles: typeof darkStyles = {
	...darkStyles,
	container: 'json-view-container json-view-dark',
	basicChildStyle: 'json-view-row',
	label: 'json-view-key',
	nullValue: 'json-view-null',
	undefinedValue: 'json-view-undefined',
	stringValue: 'json-view-string',
	booleanValue: 'json-view-boolean',
	numberValue: 'json-view-number',
	otherValue: 'json-view-other',
	punctuation: 'json-view-punctuation',
	collapseIcon: 'json-view-collapse',
	expandIcon: 'json-view-expand',
	collapsedContent: 'json-view-collapsed-content',
	childFieldsContainer: 'json-view-children',
}

// Custom light styles
const customLightStyles: typeof defaultStyles = {
	...defaultStyles,
	container: 'json-view-container json-view-light',
	basicChildStyle: 'json-view-row',
	label: 'json-view-key-light',
	nullValue: 'json-view-null-light',
	undefinedValue: 'json-view-undefined-light',
	stringValue: 'json-view-string-light',
	booleanValue: 'json-view-boolean-light',
	numberValue: 'json-view-number-light',
	otherValue: 'json-view-other-light',
	punctuation: 'json-view-punctuation-light',
	collapseIcon: 'json-view-collapse',
	expandIcon: 'json-view-expand',
	collapsedContent: 'json-view-collapsed-content',
	childFieldsContainer: 'json-view-children',
}

export const JsonViewer = forwardRef<JsonViewerRef, JsonViewerProps>(
	function JsonViewer({ data, className, collapsed = false }, ref) {
		const { theme } = useSettingsStore()
		const [isDark, setIsDark] = useState(true)
		const [collapseKey, setCollapseKey] = useState(0)
		const [isCollapsed, setIsCollapsed] = useState(collapsed === true)

		// Resolve theme
		useEffect(() => {
			if (theme === 'system') {
				const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
				setIsDark(dark)
				const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
				const mq = window.matchMedia('(prefers-color-scheme: dark)')
				mq.addEventListener('change', handler)
				return () => mq.removeEventListener('change', handler)
			} else {
				setIsDark(theme === 'dark')
			}
		}, [theme])

		// Collapse/expand methods
		useImperativeHandle(ref, () => ({
			expandAll: () => {
				setIsCollapsed(false)
				setCollapseKey(k => k + 1)
			},
			collapseAll: () => {
				setIsCollapsed(true)
				setCollapseKey(k => k + 1)
			},
		}))

		// Collapse logic
		const shouldExpandNode = useCallback(
			(level: number) => {
				if (isCollapsed) return false
				if (typeof collapsed === 'number') return level < collapsed
				return true
			},
			[isCollapsed, collapsed]
		)

		// Count lines for line numbers
		const lineCount = useMemo(() => {
			try {
				const str = JSON.stringify(data, null, 2)
				return str.split('\n').length
			} catch {
				return 1
			}
		}, [data])

		return (
			<div className={`json-viewer-wrapper ${className || ''}`}>
				<div className="json-line-numbers">
					{Array.from({ length: lineCount }, (_, i) => (
						<div key={i} className="json-line-num">{i + 1}</div>
					))}
				</div>
				<div className="json-content-area">
					<JsonView
						key={collapseKey}
						data={data as object}
						shouldExpandNode={isCollapsed ? collapseAllNested : (collapsed ? shouldExpandNode : allExpanded)}
						style={isDark ? customDarkStyles : customLightStyles}
					/>
				</div>
			</div>
		)
	}
)

export type { JsonViewerProps }
