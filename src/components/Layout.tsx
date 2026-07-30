import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Heart, Lightbulb, Settings } from 'lucide-react'
import { InviteOverlay } from './InviteOverlay'
import { useCouple } from '../context/CoupleContext'

const tabs = [
  { to: '/', label: 'Dnes', icon: Heart, end: true, fill: true },
  { to: '/calendar', label: 'Kalendář', icon: CalendarDays },
  { to: '/ideas', label: 'Nápady', icon: Lightbulb },
  { to: '/settings', label: 'Nastavení', icon: Settings },
]

export function Layout() {
  const { incomingInvitation, dismissInvitationNotice } = useCouple()
  const [showWizard, setShowWizard] = useState(false)

  const overlayOpen = Boolean(incomingInvitation) || showWizard

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col bg-white">
      <main className="min-h-0 flex-1 overflow-y-auto pb-28">
        <Outlet context={{ openInviteWizard: () => setShowWizard(true) }} />
      </main>
      {!overlayOpen && (
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
      )}
      <InviteOverlay
        showWizard={showWizard}
        onCloseWizard={() => setShowWizard(false)}
        onWizardSent={() => setShowWizard(false)}
        onAcceptDone={() => dismissInvitationNotice()}
      />
    </div>
  )
}
