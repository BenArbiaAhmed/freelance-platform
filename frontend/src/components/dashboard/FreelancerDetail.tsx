import { ArrowLeft, Star, MapPin, CheckCircle2, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFreelancersStore } from '@/store/freelancers'
import { useMissionsStore } from '@/store/missions'
import { cn } from '@/lib/utils'
import { resolvePhotoUrl } from '@/lib/api'

const niveauConfig: Record<string, { label: string; width: string; color: string }> = {
  Expert:   { label: 'Expert',   width: 'w-full',    color: 'bg-violet-500' },
  Advanced: { label: 'Advanced', width: 'w-3/4',     color: 'bg-sky-500' },
  Intermediate: { label: 'Intermediate', width: 'w-1/2', color: 'bg-amber-500' },
  Beginner: { label: 'Beginner', width: 'w-1/4',     color: 'bg-gray-400' },
}

interface Props {
  freelancerId: string
  onBack: () => void
}

export function FreelancerDetail({ freelancerId, onBack }: Props) {
  const freelancer = useFreelancersStore((s) => s.freelancers.find((f) => f.id === freelancerId))
  const pastMissions = useMissionsStore((s) => s.missions).slice(0, 3)
  if (!freelancer) return null

  const stats = [
    { label: 'Missions done', value: '14' },
    { label: 'Repeat clients', value: '8' },
    { label: 'Avg. response', value: '< 2h' },
    { label: 'On-time rate', value: '98%' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to freelancers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left: profile ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Hero card */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-5">
              {/* Avatar + name */}
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  {resolvePhotoUrl(freelancer.photo) ? (
                    <img
                      src={resolvePhotoUrl(freelancer.photo)!}
                      alt={freelancer.nom}
                      className="w-20 h-20 rounded-2xl object-cover border border-border shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border border-border bg-secondary shadow-sm flex items-center justify-center">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  {freelancer.disponible && (
                    <span className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Available
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">{freelancer.nom}</h1>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < Math.round(freelancer.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-border'
                          )}
                        />
                      ))}
                      <span className="text-sm font-semibold text-foreground ml-1">{freelancer.rating}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> Remote
                    </span>
                    {!freelancer.disponible && (
                      <Badge variant="secondary" className="text-xs">Currently unavailable</Badge>
                    )}
                  </div>
                </div>

                <p className="text-2xl font-black text-foreground shrink-0">
                  ${freelancer.tarifJournalier}
                  <span className="text-xs font-normal text-muted-foreground">/day</span>
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border pt-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{freelancer.bio}</p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-foreground">Skills & expertise</h2>
              <div className="flex flex-col gap-3">
                {freelancer.competences.map((c) => {
                  const cfg = niveauConfig[c.niveau] ?? niveauConfig['Intermediate']
                  return (
                    <div key={c.nom} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{c.nom}</span>
                        <span className="text-muted-foreground">{cfg.label}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', cfg.width, cfg.color)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Past missions */}
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Recent missions</h2>
              </div>
              <ul className="divide-y divide-border">
                {pastMissions.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-6 py-4 hover:bg-secondary/40 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0 text-xs font-bold">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{m.titre}</p>
                      <p className="text-xs text-muted-foreground">{m.client.entreprise}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">${m.budget.toLocaleString()}</p>
                      <div className="flex items-center gap-0.5 justify-end">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: contact card ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          <Card className={cn(freelancer.disponible ? 'border-emerald-200 bg-emerald-50/40' : '')}>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn('w-4 h-4', freelancer.disponible ? 'text-emerald-600' : 'text-muted-foreground')} />
                <span className="text-sm font-medium text-foreground">
                  {freelancer.disponible ? 'Available for new missions' : 'Currently unavailable'}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily rate</span>
                  <span className="font-semibold text-foreground">${freelancer.tarifJournalier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-semibold text-foreground">{freelancer.rating} / 5</span>
                </div>
              </div>

              <Button className="w-full shadow-md shadow-primary/20" disabled={!freelancer.disponible}>
                Invite to a mission
              </Button>
              <Button variant="outline" className="w-full">
                Send a message
              </Button>
            </CardContent>
          </Card>

          {/* Competence badges summary */}
          <Card>
            <CardContent className="p-5 flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {freelancer.competences.map((c) => (
                  <Badge key={c.nom} variant="secondary" className="text-xs">{c.nom}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
