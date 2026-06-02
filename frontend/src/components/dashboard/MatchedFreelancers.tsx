import { useEffect, useState } from 'react'
import { Sparkles, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  getMatchedFreelancers,
  matchPercent,
  type MatchedFreelance,
} from '@/lib/matching'
import { apiErrorMessage } from '@/lib/api'

interface Props {
  missionId: string
}

/** Client-only panel: freelancers ranked by AI match to this mission. */
export function MatchedFreelancers({ missionId }: Props) {
  const [freelancers, setFreelancers] = useState<MatchedFreelance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getMatchedFreelancers(missionId)
      .then((data) => {
        if (active) setFreelancers(data)
      })
      .catch((err) => {
        if (active) setError(apiErrorMessage(err, 'Could not load matches'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [missionId])

  return (
    <Card className="border-primary/20">
      <CardContent className="p-0">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Best-matched freelancers
          </h2>
        </div>

        {loading && (
          <p className="px-6 py-5 text-sm text-muted-foreground">
            Ranking freelancers by fit…
          </p>
        )}

        {!loading && error && (
          <p className="px-6 py-5 text-sm text-destructive">{error}</p>
        )}

        {!loading && !error && freelancers.length === 0 && (
          <p className="px-6 py-5 text-sm text-muted-foreground">
            No matching freelancers yet. Matches appear once freelancers upload
            resumes.
          </p>
        )}

        {!loading && !error && freelancers.length > 0 && (
          <ul className="divide-y divide-border">
            {freelancers.slice(0, 8).map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-6 py-4">
                <div className="relative shrink-0">
                  {f.user.photo ? (
                    <img
                      src={f.user.photo}
                      alt={f.user.nom}
                      className="w-9 h-9 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full border border-border bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  {f.disponible && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {f.user.nom}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {f.competences
                      .slice(0, 3)
                      .map((c) => c.competence.nom)
                      .join(', ') || 'No skills listed'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {f.tarifJournalier ? (
                    <p className="text-sm font-semibold text-foreground">
                      ${f.tarifJournalier}/day
                    </p>
                  ) : null}
                  <p className="text-xs text-amber-600">★ {f.rating}</p>
                </div>
                <Badge variant="success" className="shrink-0">
                  {matchPercent(f.matchScore)}% match
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
