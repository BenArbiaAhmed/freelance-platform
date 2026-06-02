import { useEffect, useMemo, useState } from 'react'
import { Check, X, Star, ChevronDown, ExternalLink, Briefcase, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { useCandidaturesStore, type ReceivedApplication } from '@/store/candidatures'
import { cn } from '@/lib/utils'

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

interface Props {
  onViewFreelancer: (freelanceId: string) => void
}

export function ReceivedApplicationsTab({ onViewFreelancer }: Props) {
  const clientId = useAuthStore((s) => s.user?.clientProfile?.id)
  const { received, receivedLoading, receivedError, fetchReceived } = useCandidaturesStore()

  useEffect(() => {
    if (clientId) fetchReceived(clientId)
  }, [clientId, fetchReceived])

  // Group applications by mission so the client sees them per posting.
  const groups = useMemo(() => {
    const byMission = new Map<string, { titre: string; budget: number; apps: ReceivedApplication[] }>()
    for (const app of received) {
      const g = byMission.get(app.mission.id)
      if (g) g.apps.push(app)
      else byMission.set(app.mission.id, { titre: app.mission.titre, budget: app.mission.budget, apps: [app] })
    }
    return Array.from(byMission.entries()).map(([id, g]) => ({ id, ...g }))
  }, [received])

  if (!clientId) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Only clients receive applications.
      </p>
    )
  }

  if (receivedLoading && received.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading applications…</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {receivedError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {receivedError}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {received.length} application{received.length !== 1 ? 's' : ''} across {groups.length} mission{groups.length !== 1 ? 's' : ''}
      </p>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No applications received yet.
        </p>
      ) : (
        groups.map((g) => (
          <MissionGroup key={g.id} group={g} onViewFreelancer={onViewFreelancer} />
        ))
      )}
    </div>
  )
}

function MissionGroup({
  group,
  onViewFreelancer,
}: {
  group: { id: string; titre: string; budget: number; apps: ReceivedApplication[] }
  onViewFreelancer: (freelanceId: string) => void
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{group.titre}</p>
            <p className="text-xs text-muted-foreground">
              Budget ${group.budget.toLocaleString()} · {group.apps.length} applicant{group.apps.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {group.apps.map((app) => (
            <ApplicantRow key={app.id} app={app} onViewFreelancer={onViewFreelancer} />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function ApplicantRow({
  app,
  onViewFreelancer,
}: {
  app: ReceivedApplication
  onViewFreelancer: (freelanceId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { acceptApplication, rejectApplication, actingOn } = useCandidaturesStore()
  const busy = actingOn === app.id
  const f = app.freelance

  return (
    <li className="px-5 py-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          {f.photo ? (
            <img src={f.photo} alt={f.nom} className="w-10 h-10 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-10 h-10 rounded-full border border-border bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          {f.disponible && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{f.nom}</p>
            <span className="flex items-center gap-0.5 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {f.rating}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {f.competences.slice(0, 4).map((c) => (
              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
            ))}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Proposed</p>
          <p className="text-sm font-semibold text-foreground">${app.tarifPropose.toLocaleString()}</p>
        </div>

        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border self-start shrink-0', statusStyle[app.statut])}>
          {statusLabel[app.statut] ?? app.statut}
        </span>
      </div>

      {/* Cover letter toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
        {expanded ? 'Hide' : 'Read'} cover letter
      </button>
      {expanded && (
        <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/40 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
          {app.lettre}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onViewFreelancer(f.id)}
        >
          View profile <ExternalLink className="w-3.5 h-3.5" />
        </Button>

        {app.statut === 'pending' && (
          <>
            <Button
              size="sm"
              className="gap-1.5 shadow-sm shadow-primary/20"
              disabled={busy}
              onClick={() => acceptApplication(app.id)}
            >
              <Check className="w-3.5 h-3.5" />
              {busy ? 'Accepting…' : 'Accept'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => rejectApplication(app.id)}
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </Button>
          </>
        )}

        {app.statut === 'accepted' && (
          <span className="text-xs text-emerald-700 font-medium">Contract created — see Contracts tab</span>
        )}
      </div>
    </li>
  )
}
