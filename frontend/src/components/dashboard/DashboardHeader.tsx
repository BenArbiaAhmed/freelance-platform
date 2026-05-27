import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NotificationsPopup } from '@/components/dashboard/NotificationsPopup'
import { CreateMissionModal } from '@/components/dashboard/CreateMissionModal'

const tabTitles: Record<string, string> = {
  overview: 'Overview',
  missions: 'Browse Missions',
  freelancers: 'Browse Freelancers',
  applications: 'My Applications',
  contracts: 'My Contracts',
  profile: 'My Profile',
}

interface Props {
  tab: string
  role: 'freelance' | 'client'
  onRoleToggle: () => void
}

export function DashboardHeader({ tab, role, onRoleToggle }: Props) {
  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 gap-4 shrink-0">
      <h1 className="text-base font-semibold text-foreground">{tabTitles[tab]}</h1>

      <div className="flex items-center gap-3 ml-auto">
        {/* Search */}
        <div className="relative hidden sm:block w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input className="pl-9 h-8 text-sm" placeholder="Search…" />
        </div>

        {/* Post mission — clients only */}
        {role === 'client' && (
          <CreateMissionModal>
            <Button size="sm" className="gap-1.5 shadow-sm shadow-primary/20">
              <Plus className="w-3.5 h-3.5" />
              Post mission
            </Button>
          </CreateMissionModal>
        )}

        {/* Role toggle — demo only */}
        <button
          onClick={onRoleToggle}
          className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors"
          title="Toggle role (demo)"
        >
          Viewing as:
          <Badge variant={role === 'freelance' ? 'default' : 'secondary'} className="text-xs py-0">
            {role === 'freelance' ? 'Freelancer' : 'Client'}
          </Badge>
        </button>

        {/* Notifications */}
        <NotificationsPopup />
      </div>
    </header>
  )
}
