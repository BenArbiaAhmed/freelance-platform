import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  getRecommendedMissions,
  type MatchedMission,
} from '@/lib/matching'
import { apiErrorMessage } from '@/lib/api'
import { MatchScoreBadge } from '@/components/dashboard/MatchScoreBadge'
import { AxiosError } from 'axios'

interface Props {
  onSelect: (id: string) => void
}

export function RecommendedMissions({ onSelect }: Props) {
  const [missions, setMissions] = useState<MatchedMission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // 409 = no resume uploaded yet → friendly nudge instead of an error.
  const [needsResume, setNeedsResume] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setNeedsResume(false)
    getRecommendedMissions()
      .then((data) => {
        if (active) setMissions(data)
      })
      .catch((err) => {
        if (!active) return
        if (err instanceof AxiosError && err.response?.status === 409) {
          setNeedsResume(true)
        } else {
          setError(apiErrorMessage(err, 'Could not load recommendations'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-5 text-sm text-muted-foreground">
          Finding missions that match your resume…
        </CardContent>
      </Card>
    )
  }

  if (needsResume) {
    return (
      <Card className="border-dashed border-primary/40 bg-primary/5">
        <CardContent className="p-5 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Get personalised mission recommendations
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a resume in your profile and we'll rank missions by how well
              they fit your experience.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (missions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          Recommended for you
        </h2>
        <span className="text-xs text-muted-foreground">
          based on your resume
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {missions.slice(0, 6).map((m) => {
          const daysLeft = m.deadline
            ? Math.ceil(
                (new Date(m.deadline).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24),
              )
            : null
          return (
            <Card
              key={m.id}
              className="border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              onClick={() => onSelect(m.id)}
            >
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {m.titre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.client?.entreprise ??
                        m.client?.user?.nom ??
                        'Unknown client'}
                    </p>
                  </div>
                  <MatchScoreBadge
                    score={m.matchScore}
                    requiredSkills={[...m.competencesRequises, ...m.requiredSkills]}
                    candidateSkills={m.freelanceSkills}
                  />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {m.competencesRequises.slice(0, 5).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground text-base">
                      ${m.budget.toLocaleString()}
                    </span>
                    {daysLeft !== null && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed'}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(m.id)
                    }}
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="border-t border-border pt-1" />
    </div>
  )
}
