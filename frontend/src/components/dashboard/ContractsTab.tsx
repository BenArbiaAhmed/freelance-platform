import { useEffect, useState } from 'react'
import { FileSignature, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth'
import { useContratsStore } from '@/store/contrats'
import { ContractDetail } from '@/components/dashboard/ContractDetail'
import { cn } from '@/lib/utils'

type ContratStatut = 'draft' | 'signed' | 'completed' | 'cancelled'

const statusConfig: Record<ContratStatut, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: 'In progress', icon: Clock, className: 'bg-sky-50 text-sky-700' },
  signed: { label: 'Active', icon: FileSignature, className: 'bg-sky-50 text-sky-700' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-red-50 text-red-600' },
}

interface Props {
  role: 'freelance' | 'client'
}

export function ContractsTab({ role }: Props) {
  const clientId = useAuthStore((s) => s.user?.clientProfile?.id)
  const freelanceId = useAuthStore((s) => s.user?.freelanceProfile?.id)
  const { contrats, loading, error, fetchContrats } = useContratsStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const profileId = role === 'client' ? clientId : freelanceId

  const refresh = () => {
    if (!profileId) return
    fetchContrats(role === 'client' ? { clientId: profileId } : { freelanceId: profileId })
  }

  useEffect(() => {
    if (!profileId) return
    fetchContrats(role === 'client' ? { clientId: profileId } : { freelanceId: profileId })
  }, [role, profileId, fetchContrats])

  const selected = selectedId ? contrats.find((c) => c.id === selectedId) : null
  if (selected) {
    return (
      <ContractDetail
        contract={selected}
        role={role}
        onBack={() => setSelectedId(null)}
        onChanged={refresh}
      />
    )
  }

  if (!profileId) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No profile found for contracts.
      </p>
    )
  }

  if (loading && contrats.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading contracts…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {contrats.length} contract{contrats.length !== 1 ? 's' : ''}
      </p>

      {contrats.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          {role === 'client'
            ? 'No contracts yet. Accept an application to create one.'
            : 'No contracts yet. They appear once a client accepts your application.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {contrats.map((c) => {
            const cfg = statusConfig[c.statut]
            const Icon = cfg.icon
            const counterparty =
              role === 'client'
                ? c.freelanceNom
                : `${c.clientNom}${c.clientEntreprise ? ` · ${c.clientEntreprise}` : ''}`

            return (
              <Card
                key={c.id}
                className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedId(c.id)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Status icon */}
                    <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl shrink-0', cfg.className)}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{c.missionTitre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">with {counterparty}</p>
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
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
