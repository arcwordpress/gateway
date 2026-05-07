import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SnackType = 'info' | 'success' | 'error' | 'warning'

type SnackMessage = {
  id: string
  message: string
  type: SnackType
}

type SnackbarContextValue = {
  addMessage: (message: string, type?: SnackType) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const SnackbarContext = createContext<SnackbarContextValue | null>(null)

export function useSnackbar() {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 5000

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<SnackMessage[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const addMessage = useCallback(
    (message: string, type: SnackType = 'info') => {
      const id = Math.random().toString(36).slice(2)
      setMessages(prev => [...prev, { id, message, type }])
      timers.current[id] = setTimeout(() => removeMessage(id), AUTO_DISMISS_MS)
    },
    [removeMessage],
  )

  return (
    <SnackbarContext.Provider value={{ addMessage }}>
      {children}
      <SnackbarStack messages={messages} onDismiss={removeMessage} />
    </SnackbarContext.Provider>
  )
}

// ─── UI ───────────────────────────────────────────────────────────────────────

const typeStyles: Record<SnackType, string> = {
  info:    'bg-zinc-800 border-zinc-700 text-zinc-200',
  success: 'bg-emerald-950/90 border-emerald-800 text-emerald-200',
  error:   'bg-red-950/90 border-red-800 text-red-200',
  warning: 'bg-amber-950/90 border-amber-800 text-amber-200',
}

function SnackbarStack({
  messages,
  onDismiss,
}: {
  messages: SnackMessage[]
  onDismiss: (id: string) => void
}) {
  if (messages.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex items-start gap-3 pl-4 pr-3 py-3 rounded-lg shadow-lg border text-sm max-w-sm w-max ${typeStyles[msg.type]}`}
        >
          <span className="leading-snug">{msg.message}</span>
          <button
            onClick={() => onDismiss(msg.id)}
            className="mt-0.5 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
