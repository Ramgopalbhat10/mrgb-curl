import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Keyboard, X } from 'lucide-react'

interface KeyboardShortcutsModalProps {
    open: boolean
    onClose: () => void
}

const SHORTCUTS = [
    { keys: ['Ctrl', 'Enter'], description: 'Send request' },
    { keys: ['Ctrl', 'T'], description: 'New tab' },
    { keys: ['Ctrl', 'W'], description: 'Close tab' },
    { keys: ['Ctrl', 'S'], description: 'Save request' },
    { keys: ['Ctrl', 'L'], description: 'Focus URL input' },
    { keys: ['Ctrl', '/'], description: 'Toggle shortcuts help' },
    { keys: ['Esc'], description: 'Close modal' },
]

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (open) {
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Keyboard className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 space-y-3">
                    {SHORTCUTS.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, i) => (
                                    <span key={i}>
                                        <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
                                            {key}
                                        </kbd>
                                        {i < shortcut.keys.length - 1 && (
                                            <span className="mx-1 text-muted-foreground">+</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground text-center">
                    Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded">Esc</kbd> to close
                </div>
            </div>
        </div>
    )
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts() {
    const [showShortcuts, setShowShortcuts] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl + / to toggle shortcuts modal
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault()
                setShowShortcuts((prev) => !prev)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return { showShortcuts, setShowShortcuts }
}
