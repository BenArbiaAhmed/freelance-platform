import { useEffect } from 'react'
import { Briefcase, BookOpen, FileText, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useMissionsStore } from '@/store/missions'
import { useAuthStore } from '@/store/auth'
import { useCandidaturesStore } from '@/store/candidatures'
import { useContratsStore } from '@/store/contrats'
import type { DashTab } from '@/components/dashboard/Sidebar'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  signed: 'bg-sky-50 text-sky-700',
  active: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-gray-100 text-gray-500',
  completed: 'bg-violet-50 text-violet-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

interface Props {
  role: 'freelance' | 'client'
  onNavigate: (tab: DashTab) => void
  onSelectMission: (id: string) => void
}

export function OverviewTab({ role, onNavigate, onSelectMission }: Props) {
  const { missions, fetchMissions } = useMissionsStore()
  const freelanceId = useAuthStore((s) => s.user?.freelanceProfile?.id)
  const clientId = useAuthStore((s) => s.user?.clientProfile?.id)

  const { candidatures, fetchCandidatures, received, fetchReceived } = useCandidaturesStore()
  const { contrats, fetchContrats } = useContratsStore()

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  useEffect(() => {
    if (role === 'freelance' && freelanceId) {
      fetchCandidatures(freelanceId)
      fetchContrats({ freelanceId })
    } else if (role === 'client' && clientId) {
      fetchReceived(clientId)
      fetchContrats({ clientId })
    }
  }, [role, freelanceId, clientId, fetchCandidatures, fetchReceived, fetchContrats])

  const activeContracts = contrats.filter((c) => c.statut === 'signed').length

  const stats = role === 'freelance'
    ? [
        { label: 'Open Missions', value: missions.filter(m => m.statut === 'active').length, icon: Briefcase, color: 'bg-violet-50 text-violet-600', delta: 'Browse all', tab: 'missions' as DashTab },
        { label: 'My Applications', value: candidatures.length, icon: BookOpen, color: 'bg-sky-50 text-sky-600', delta: `${candidatures.filter(c => c.statut === 'pending').length} pending`, tab: 'applications' as DashTab },
        { label: 'Active Contracts', value: activeContracts, icon: FileText, color: 'bg-emerald-50 text-emerald-600', delta: 'In progress', tab: 'contracts' as DashTab },
        { label: 'Contracts', value: contrats.length, icon: DollarSign, color: 'bg-amber-50 text-amber-600', delta: 'Total signed', tab: 'contracts' as DashTab },
      ]
    : [
        { label: 'My Missions', value: missions.length, icon: Briefcase, color: 'bg-violet-50 text-violet-600', delta: `${missions.filter(m => m.statut === 'active').length} active`, tab: 'missions' as DashTab },
        { label: 'Applications Received', value: received.length, icon: BookOpen, color: 'bg-sky-50 text-sky-600', delta: `${received.filter(a => a.statut === 'pending').length} pending`, tab: 'applications' as DashTab },
        { label: 'Active Contracts', value: activeContracts, icon: FileText, color: 'bg-emerald-50 text-emerald-600', delta: 'In progress', tab: 'contracts' as DashTab },
        { label: 'Contracts', value: contrats.length, icon: DollarSign, color: 'bg-amber-50 text-amber-600', delta: 'Total signed', tab: 'contracts' as DashTab },
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
              {missions.slice(0, 4).map((m) => (
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

        {/* Activity panel */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                {role === 'freelance' ? 'My Applications' : 'Recent Applications'}
              </h2>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <ul className="divide-y divide-border">
              {role === 'freelance'
                ? candidatures.slice(0, 5).map((c) => (
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
                  ))
                : received.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors">
                      <img src={a.freelance.photo} alt={a.freelance.nom} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{a.freelance.nom}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.mission.titre}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[a.statut] ?? ''}`}>
                        {a.statut}
                      </span>
                    </li>
                  ))}
            </ul>
            {((role === 'freelance' && candidatures.length === 0) ||
              (role === 'client' && received.length === 0)) && (
              <p className="px-5 py-6 text-sm text-muted-foreground text-center">No applications yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
