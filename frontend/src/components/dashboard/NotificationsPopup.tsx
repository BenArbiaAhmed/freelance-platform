import { useEffect, useRef, useState } from 'react'
import { Bell, Briefcase, FileText, DollarSign, UserCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type NotifType = 'candidature.submitted' | 'candidature.accepted' | 'contrat.signed' | 'payment.received' | 'mission.closed'

interface Notification {
  id: string
  type: NotifType
  title: string
  description: string
  time: string
  read: boolean
}

const MOCK_NOTIFS: Notification[] = [
  { id: '1', type: 'candidature.submitted', title: 'New application', description: 'Aisha Kamara applied to "Senior React Developer for SaaS Dashboard"', time: '2m ago', read: false },
  { id: '2', type: 'contrat.signed', title: 'Contract signed', description: 'Your contract with Lucas Ferreira is now active', time: '1h ago', read: false },
  { id: '3', type: 'payment.received', title: 'Payment received', description: '$2,600 was credited to your account', time: '3h ago', read: false },
  { id: '4', type: 'candidature.accepted', title: 'Application accepted', description: 'Buildwise accepted your proposal for "UX/UI Designer for Mobile App"', time: 'Yesterday', read: true },
  { id: '5', type: 'mission.closed', title: 'Mission closed', description: '"GraphQL API Integration Specialist" has been closed by the client', time: '2 days ago', read: true },
  { id: '6', type: 'candidature.submitted', title: 'New application', description: 'Omar Shaikh applied to "DevOps Engineer — CI/CD Pipeline Setup"', time: '3 days ago', read: true },
]

const ICONS: Record<NotifType, { icon: React.ElementType; bg: string; color: string }> = {
  'candidature.submitted': { icon: UserCheck,  bg: 'bg-sky-50',    color: 'text-sky-600' },
  'candidature.accepted':  { icon: UserCheck,  bg: 'bg-emerald-50', color: 'text-emerald-600' },
  'contrat.signed':        { icon: FileText,   bg: 'bg-violet-50', color: 'text-violet-600' },
  'payment.received':      { icon: DollarSign, bg: 'bg-amber-50',  color: 'text-amber-600' },
  'mission.closed':        { icon: Briefcase,  bg: 'bg-gray-100',  color: 'text-gray-500' },
}

export function NotificationsPopup() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifs.filter((n) => !n.read).length

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function markAllRead() {
    setNotifs((n) => n.map((x) => ({ ...x, read: true })))
  }

  function dismiss(id: string) {
    setNotifs((n) => n.filter((x) => x.id !== id))
  }

  function markRead(id: string) {
    setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x))
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-primary text-white text-[10px] font-bold px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 sm:w-96 bg-white rounded-2xl border border-border shadow-xl shadow-black/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
              {unreadCount > 0 && (
                <span className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifs.length === 0 && (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No notifications
              </li>
            )}
            {notifs.map((n) => {
              const cfg = ICONS[n.type]
              const Icon = cfg.icon
              return (
                <li
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-secondary/40',
                    !n.read && 'bg-primary/[0.03]'
                  )}
                >
                  <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5', cfg.bg, cfg.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm', !n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80')}>
                        {n.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{n.description}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">{n.time}</p>
                  </div>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
