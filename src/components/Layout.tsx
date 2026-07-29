import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Heart, Lightbulb, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Dnes', icon: Heart, end: true, fill: true },
  { to: '/calendar', label: 'Kalendář', icon: CalendarDays },
  { to: '/ideas', label: 'Nápady', icon: Lightbulb },
  { to: '/settings', label: 'Nastavení', icon: Settings },
]

export function Layout() {
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col bg-white">
      <main className="min-h-0 flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/[0.04] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg justify-around px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {tabs.map(({ to, label, icon: Icon, end, fill }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-w-[68px] flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 text-[11px] font-medium transition ${
                  isActive ? 'bg-surface text-love' : 'text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.4 : 2}
                    fill={fill && isActive ? 'currentColor' : 'none'}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
