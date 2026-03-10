import { Link } from '@tanstack/react-router'
import { Settings2 } from 'lucide-react'

// ─── Nav link ──────────────────────────────────────────────────────────────
function NavLink({ to, label, icon: Icon }: { to: string; label: string; icon?: any }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
      activeProps={{
        className:
          'flex items-center gap-2 px-3 py-2 rounded text-sm text-blue-300 bg-blue-500/10 hover:text-blue-300 hover:bg-blue-500/10 transition-colors',
      }}
    >
      {Icon && <Icon className="w-4 h-4" />}
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
    <nav className="flex-1 flex flex-col">
      {/* Top navigation items - scrollable */}
      <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <SectionLabel label="Structure" />
        <NavLink to="/" label="Dashboard" />
        <NavLink to="/extensions" label="Extensions" />
        <NavLink to="/collections" label="Collections" />
        
        <div className="my-3 border-t border-gray-800" />
        
        <SectionLabel label="Builders" />
        <NavLink to="/fields" label="Fields" />
        <NavLink to="/forms" label="Forms" />
        <NavLink to="/views" label="Views" />
      </div>
      
      {/* Bottom items - always visible at bottom */}
      <div className="p-2 space-y-0.5 border-t border-gray-800">
        <SectionLabel label="Help" />
        <a
          href="https://arcwp.ca/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-2 rounded text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
        >
          Documentation
        </a>
        <a
          href="https://arcwp.ca/support"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-2 rounded text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
        >
          Support
        </a>
        
        <div className="my-2 border-t border-gray-800" />
        
        <NavLink to="/settings" label="Settings" icon={Settings2} />
      </div>
    </nav>
  )
}
