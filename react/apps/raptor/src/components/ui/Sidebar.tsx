import { Link } from '@tanstack/react-router'

// ─── Nav link ──────────────────────────────────────────────────────────────
function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      className="flex items-center px-3 py-2 rounded text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      activeProps={{
        className:
          'flex items-center px-3 py-2 rounded text-sm text-blue-300 bg-blue-500/10 hover:text-blue-300 hover:bg-blue-500/10 transition-colors',
      }}
    >
      {label}
    </Link>
  )
}

// ─── Section divider ───────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
      {label}
    </p>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar() {
  return (
    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
      <SectionLabel label="App" />
      <NavLink to="/extensions" label="Extensions" />
      <NavLink to="/collections" label="Collections" />

    </nav>
  )
}
