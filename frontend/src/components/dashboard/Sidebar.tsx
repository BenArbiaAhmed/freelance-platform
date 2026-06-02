import { Zap, LayoutDashboard, Briefcase, Users, FileText, BookOpen, LogOut, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { resolvePhotoUrl } from '@/lib/api'

export type DashTab = 'overview' | 'missions' | 'freelancers' | 'applications' | 'contracts' | 'profile'

interface NavItem {
  id: DashTab
  label: string
  icon: React.ElementType
}

const freelancerNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'missions', label: 'Find Work', icon: Briefcase },
  { id: 'applications', label: 'My Applications', icon: BookOpen },
  { id: 'contracts', label: 'My Contracts', icon: FileText },
]

const clientNavItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'missions', label: 'My Missions', icon: Briefcase },
  { id: 'freelancers', label: 'Freelancers', icon: Users },
  { id: 'applications', label: 'Applications Received', icon: BookOpen },
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
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const navItems = user.role === 'client' ? clientNavItems : freelancerNavItems

  function handleLogout() {
    logout()
    navigate('/')
  }

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

      {/* Bottom section: Profile row (avatar = profile button) + Logout */}
      <div className="border-t border-border px-2 py-3 flex items-center gap-1">
        <button
          onClick={() => onNavigate('profile')}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 min-w-0 flex-1 text-left transition-colors',
            active === 'profile'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            collapsed && 'justify-center px-0 flex-none w-10'
          )}
          title={collapsed ? 'Profile' : undefined}
        >
          {resolvePhotoUrl(user.photo) ? (
            <img
              src={resolvePhotoUrl(user.photo)!}
              alt={user.nom}
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-secondary border border-border shrink-0 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.nom}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
            </div>
          )}
        </button>
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
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
