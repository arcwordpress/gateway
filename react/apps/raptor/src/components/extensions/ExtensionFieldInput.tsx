type ExtensionField = {
  name: string
  type: string
  label: string
  required?: boolean
  placeholder?: string
  default?: string
}

type FieldInputProps = {
  field: ExtensionField
  value: string
  disabled: boolean
  autoFocus?: boolean
  onChange: (val: string) => void
}

const baseInput =
  'w-full px-3 py-2 rounded-lg bg-transparent border border-zinc-800/60 text-zinc-200 ' +
  'placeholder-zinc-700 focus:outline-none focus:border-zinc-600 ' +
  'focus:ring-zinc-500 transition-colors disabled:opacity-50 text-sm'

export function FieldSkeleton() {
  return (
    <div className="space-y-1.5">
      <div className="h-3 w-20 rounded bg-zinc-900 animate-pulse" />
      <div className="h-8 rounded-lg bg-zinc-900 animate-pulse" />
    </div>
  )
}

export default function FieldInput({
  field,
  value,
  disabled,
  autoFocus,
  onChange,
}: FieldInputProps) {
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={field.placeholder}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className={baseInput + ' resize-none'}
      />
    )
  }

  return (
    <input
      type={field.type === 'url' ? 'url' : 'text'}
      value={value}
      disabled={disabled}
      autoFocus={autoFocus}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={baseInput}
    />
  )
}

export type { ExtensionField }
