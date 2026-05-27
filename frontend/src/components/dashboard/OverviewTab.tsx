import { Briefcase, BookOpen, FileText, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MISSIONS, MY_CANDIDATURES, MY_CONTRATS } from '@/lib/mock-data'
import type { DashTab } from '@/components/dashboard/Sidebar'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  signed: 'bg-sky-50 text-sky-700',
  completed: 'bg-violet-50 text-violet-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

interface Props {
  role: 'freelance' | 'client'
  onNavigate: (tab: DashTab) => void
  onSelectMission: (id: string) => void
}

export function OverviewTab({ role, onNavigate, onSelectMission }: Props) {
  const stats = role === 'freelance'
    ? [
        { label: 'Open Missions', value: MISSIONS.filter(m => m.statut === 'active').length, icon: Briefcase, color: 'bg-violet-50 text-violet-600', delta: '+4 this week', tab: 'missions' as DashTab },
        { label: 'My Applications', value: MY_CANDIDATURES.length, icon: BookOpen, color: 'bg-sky-50 text-sky-600', delta: `${MY_CANDIDATURES.filter(c => c.statut === 'pending').length} pending`, tab: 'applications' as DashTab },
        { label: 'Active Contracts', value: MY_CONTRATS.filter(c => c.statut === 'signed').length, icon: FileText, color: 'bg-emerald-50 text-emerald-600', delta: 'In progress', tab: 'contracts' as DashTab },
        { label: 'Total Earned', value: '$4,350', icon: DollarSign, color: 'bg-amber-50 text-amber-600', delta: '+$1,750 this month', tab: null },
      ]
    : [
        { label: 'My Missions', value: 3, icon: Briefcase, color: 'bg-violet-50 text-violet-600', delta: '2 active', tab: 'missions' as DashTab },
        { label: 'Candidatures Received', value: 38, icon: BookOpen, color: 'bg-sky-50 text-sky-600', delta: '12 unreviewed', tab: 'applications' as DashTab },
        { label: 'Active Contracts', value: 2, icon: FileText, color: 'bg-emerald-50 text-emerald-600', delta: 'In progress', tab: 'contracts' as DashTab },
        { label: 'Total Spent', value: '$9,100', icon: DollarSign, color: 'bg-amber-50 text-amber-600', delta: '+$3,200 this month', tab: null },
      ]

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card
              key={s.label}
              className={s.tab ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}
              onClick={s.tab ? () => onNavigate(s.tab!) : undefined}
            >
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {s.delta}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent missions */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Recent Missions</h2>
              <button
                onClick={() => onNavigate('missions')}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <ul className="divide-y divide-border">
              {MISSIONS.slice(0, 4).map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors cursor-pointer"
                  onClick={() => onSelectMission(m.id)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{m.titre}</p>
                    <p className="text-xs text-muted-foreground">{m.client.entreprise} · ${m.budget.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[m.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                    {m.statut}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* My activity */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                {role === 'freelance' ? 'My Applications' : 'Recent Candidatures'}
              </h2>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <ul className="divide-y divide-border">
              {MY_CANDIDATURES.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.mission.titre}</p>
                    <p className="text-xs text-muted-foreground">Proposed: ${c.tarifPropose.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[c.statut] ?? ''}`}>
                    {c.statut}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
