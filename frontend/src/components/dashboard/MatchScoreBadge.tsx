import { matchPercent, matchLabel, matchColors } from '@/lib/matching'
import { cn } from '@/lib/utils'

interface Props {
  score: number
  /** Skills the role/mission requires. */
  requiredSkills?: string[]
  /** Skills the freelancer/candidate has. */
  candidateSkills?: string[]
}

function normalize(skills: string[]): string[] {
  return skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
}

export function MatchScoreBadge({ score, requiredSkills, candidateSkills }: Props) {
  const pct = matchPercent(score)
  const label = matchLabel(score)
  const { badge, dot } = matchColors(score)

  const normalizedRequired = normalize(requiredSkills ?? [])
  const normalizedCandidate = new Set(normalize(candidateSkills ?? []))

  const matched = normalizedRequired.filter((s) => normalizedCandidate.has(s))
  const missing = normalizedRequired.filter((s) => !normalizedCandidate.has(s))
  const hasBreakdown = normalizedRequired.length > 0 && normalizedCandidate.size > 0

  return (
    <div className="relative group/match shrink-0">
      {/* Badge */}
      <div className={cn('flex flex-col items-center px-2.5 py-1.5 rounded-lg border text-center cursor-default select-none', badge)}>
        <span className="text-sm font-bold leading-none">{pct}%</span>
        <span className="text-[10px] font-medium leading-tight mt-0.5 whitespace-nowrap">{label}</span>
      </div>

      {/* Hover popover */}
      {hasBreakdown && (
        <div className={cn(
          'absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border bg-popover shadow-lg p-3 flex flex-col gap-2',
          'opacity-0 pointer-events-none scale-95',
          'group-hover/match:opacity-100 group-hover/match:pointer-events-auto group-hover/match:scale-100',
          'transition-all duration-150 origin-top-right',
        )}>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Skill breakdown
          </p>

          {matched.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wide">Matched</p>
              <div className="flex flex-wrap gap-1">
                {matched.map((s) => (
                  <span key={s} className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Not found</p>
              <div className="flex flex-wrap gap-1">
                {missing.map((s) => (
                  <span key={s} className="text-xs px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border capitalize">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {matched.length === 0 && missing.length === 0 && (
            <p className="text-xs text-muted-foreground">No explicit skill overlap detected.</p>
          )}

          <p className="text-[10px] text-muted-foreground/70 border-t border-border pt-2 mt-0.5">
            Score = 80% semantic · 20% skill overlap
          </p>
        </div>
      )}
    </div>
  )
}
