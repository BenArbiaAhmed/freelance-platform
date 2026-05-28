import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { useCandidaturesStore } from '@/store/candidatures'
import { ReceivedApplicationsTab } from '@/components/dashboard/ReceivedApplicationsTab'
import { cn } from '@/lib/utils'

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

const statusLabel: Record<string, string> = {
  pending: 'Pending review',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

interface Props {
  role: 'freelance' | 'client'
  onViewFreelancer: (freelanceId: string) => void
}

export function ApplicationsTab({ role, onViewFreelancer }: Props) {
  if (role === 'client') {
    return <ReceivedApplicationsTab onViewFreelancer={onViewFreelancer} />
  }
  return <SentApplicationsTab />
}

function SentApplicationsTab() {
  const freelanceId = useAuthStore((s) => s.user?.freelanceProfile?.id)
  const { candidatures, loading, error, fetchCandidatures } = useCandidaturesStore()

  useEffect(() => {
    if (freelanceId) fetchCandidatures(freelanceId)
  }, [freelanceId, fetchCandidatures])

  if (!freelanceId) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Only freelancers have applications.
      </p>
    )
  }

  if (loading && candidatures.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading applications…</p>
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {candidatures.length} application{candidatures.length !== 1 ? 's' : ''} submitted
      </p>

      {candidatures.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          You haven't applied to any missions yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {candidatures.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Mission info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{c.mission.titre}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {c.mission.competencesRequises.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Rates */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Mission budget</p>
                      <p className="text-sm font-semibold text-foreground">${c.mission.budget.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Your rate</p>
                      <p className="text-sm font-semibold text-foreground">${c.tarifPropose.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Applied</p>
                      <p className="text-sm text-foreground">
                        {new Date(c.dateCreation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={cn('text-xs font-medium px-3 py-1 rounded-full border self-start sm:self-center', statusStyle[c.statut])}>
                    {statusLabel[c.statut] ?? c.statut}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
