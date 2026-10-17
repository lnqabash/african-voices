import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Upload, Library, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/library', label: 'Story Library', icon: Library },
  { to: '/upload', label: 'Upload Story', icon: Upload },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-gradient-to-r from-orange-900 via-amber-800 to-yellow-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="African Voices Home">
            <div className="w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-orange-900" aria-hidden="true" />
            </div>
            <div className="text-white">
              <span className="font-bold text-lg leading-none block">African Voices</span>
              <span className="text-amber-200 text-xs leading-none">Heritage Archive</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${pathname === to
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-amber-100 hover:bg-white/10 hover:text-white'}`}
                aria-current={pathname === to ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-amber-100 hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1" role="menu">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${pathname === to
                  ? 'bg-white/20 text-white'
                  : 'text-amber-100 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
