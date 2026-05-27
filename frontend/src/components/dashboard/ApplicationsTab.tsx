import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MY_CANDIDATURES } from '@/lib/mock-data'
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

export function ApplicationsTab() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{MY_CANDIDATURES.length} application{MY_CANDIDATURES.length !== 1 ? 's' : ''} submitted</p>

      <div className="flex flex-col gap-3">
        {MY_CANDIDATURES.map((c) => (
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
                    <p className="text-sm text-foreground">{new Date(c.dateCreation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={cn('text-xs font-medium px-3 py-1 rounded-full border self-start sm:self-center', statusStyle[c.statut])}>
                  {statusLabel[c.statut]}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
