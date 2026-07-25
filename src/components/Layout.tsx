import { NavLink, Outlet } from 'react-router-dom'
import { CalendarHeart, Heart, Lightbulb, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Dnes', icon: Heart, end: true },
  { to: '/calendar', label: 'Kalendář', icon: CalendarHeart },
  { to: '/ideas', label: 'Nápady', icon: Lightbulb },
  { to: '/settings', label: 'Nastavení', icon: Settings },
]

export function Layout() {
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition ${
                  isActive ? 'text-love' : 'text-muted'
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
