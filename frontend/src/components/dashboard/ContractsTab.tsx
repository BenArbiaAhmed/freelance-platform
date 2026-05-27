import { FileSignature, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MY_CONTRATS, type ContratStatut } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusConfig: Record<ContratStatut, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: 'Draft', icon: Clock, className: 'bg-gray-100 text-gray-500' },
  signed: { label: 'Active', icon: FileSignature, className: 'bg-sky-50 text-sky-700' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-50 text-red-600' },
}

export function ContractsTab() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{MY_CONTRATS.length} contract{MY_CONTRATS.length !== 1 ? 's' : ''}</p>

      <div className="flex flex-col gap-3">
        {MY_CONTRATS.map((c) => {
          const cfg = statusConfig[c.statut]
          const Icon = cfg.icon

          return (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Status icon */}
                  <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl shrink-0', cfg.className)}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.mission.titre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      with {c.client.nom} · {c.client.entreprise}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-sm font-semibold text-foreground">${c.montant.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="text-sm text-foreground">
                        {new Date(c.dateCreation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Status + action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', cfg.className)}>
                      {cfg.label}
                    </span>
                    {c.statut === 'signed' && (
                      <Button size="sm" variant="outline">Open chat</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
