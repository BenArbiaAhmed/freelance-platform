import { useState } from 'react'
import { Calendar, Users, ArrowRight, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { MISSIONS, type Mission } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ALL_SKILLS = Array.from(new Set(MISSIONS.flatMap((m) => m.competencesRequises)))

export function MissionsTab() {
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  const filtered = MISSIONS.filter((m) => {
    const matchesSearch =
      search === '' ||
      m.titre.toLowerCase().includes(search.toLowerCase()) ||
      m.competencesRequises.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    const matchesSkill = !selectedSkill || m.competencesRequises.includes(selectedSkill)
    return matchesSearch && matchesSkill
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search missions or skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSkill(null)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              selectedSkill === null
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
            )}
          >
            All
          </button>
          {ALL_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-colors',
                selectedSkill === skill
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">{filtered.length} mission{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Mission cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((m) => <MissionCard key={m.id} mission={m} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No missions match your filters.</p>
        </div>
      )}
    </div>
  )
}

function MissionCard({ mission: m }: { mission: Mission }) {
  const daysLeft = Math.ceil(
    (new Date(m.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={m.client.photo ?? `https://i.pravatar.cc/36?u=${m.client.nom}`}
              alt={m.client.nom}
              className="w-9 h-9 rounded-full object-cover border border-border"
            />
            <div>
              <p className="text-sm font-semibold text-foreground line-clamp-1">{m.titre}</p>
              <p className="text-xs text-muted-foreground">{m.client.entreprise}</p>
            </div>
          </div>
          <Badge variant="success" className="shrink-0">{m.statut}</Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{m.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {m.competencesRequises.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground text-base">${m.budget.toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {daysLeft > 0 ? `${daysLeft}d left` : 'Deadline passed'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {m.candidatureCount}
            </span>
          </div>
          <Button size="sm" className="gap-1.5">
            Apply <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
