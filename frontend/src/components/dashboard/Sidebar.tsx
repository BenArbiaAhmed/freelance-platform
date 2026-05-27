import { Zap, LayoutDashboard, Briefcase, Users, FileText, BookOpen, UserCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export type DashTab = 'overview' | 'missions' | 'freelancers' | 'applications' | 'contracts' | 'profile'

interface NavItem {
  id: DashTab
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'missions', label: 'Missions', icon: Briefcase },
  { id: 'freelancers', label: 'Freelancers', icon: Users },
  { id: 'applications', label: 'Applications', icon: BookOpen },
  { id: 'contracts', label: 'Contracts', icon: FileText },
]

interface Props {
  active: DashTab
  onNavigate: (tab: DashTab) => void
  collapsed: boolean
  onToggleCollapse: () => void
  user: { nom: string; role: string; photo?: string }
}

export function Sidebar({ active, onNavigate, collapsed, onToggleCollapse, user }: Props) {
  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-white border-r border-border transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 border-b border-border px-4 gap-3', collapsed && 'justify-center px-0')}>
        <Link to="/" className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shrink-0">
          <Zap className="w-4 h-4" />
        </Link>
        {!collapsed && <span className="font-bold text-base text-foreground truncate">FreelanceHub</span>}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left',
              active === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom section: Profile + Logout */}
      <div className="border-t border-border px-2 py-3 flex flex-col gap-1">
        {/* Profile nav item */}
        <button
          onClick={() => onNavigate('profile')}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full text-left',
            active === 'profile'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Profile' : undefined}
        >
          <UserCircle className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Profile</span>}
        </button>

        {/* User row */}
        <div className={cn('flex items-center gap-3 px-3 py-2', collapsed && 'justify-center px-0')}>
          <img
            src={user.photo ?? `https://i.pravatar.cc/32?u=${user.nom}`}
            alt={user.nom}
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
          />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user.nom}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors shrink-0" title="Log out">
                <LogOut className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-border shadow-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
