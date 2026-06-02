import { useEffect, useState } from 'react'
import { Calendar, Users, ArrowRight, Search, Plus, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { MissionDetail } from '@/components/dashboard/MissionDetail'
import { CreateMissionModal } from '@/components/dashboard/CreateMissionModal'
import { RecommendedMissions } from '@/components/dashboard/RecommendedMissions'
import { type Mission } from '@/lib/mock-data'
import {
  useMissionsStore,
  type MissionSortField,
  type SortDirection,
} from '@/store/missions'
import { cn } from '@/lib/utils'
import { resolvePhotoUrl } from '@/lib/api'

interface Props {
  selectedId: string | null
  onSelect: (id: string | null) => void
  role: 'freelance' | 'client'
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'DATE_CREATION:DESC', label: 'Newest' },
  { value: 'BUDGET:DESC', label: 'Budget: high to low' },
  { value: 'BUDGET:ASC', label: 'Budget: low to high' },
  { value: 'DEADLINE:ASC', label: 'Deadline: soonest' },
  { value: 'TITRE:ASC', label: 'Title: A–Z' },
]

export function MissionsTab({ selectedId, onSelect, role }: Props) {
  const { missions, allSkills, loading, error, fetchMissions } = useMissionsStore()
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [sort, setSort] = useState('DATE_CREATION:DESC')

  // Push every filter/sort change to the GraphQL search query, debounced so
  // typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const [sortField, sortDirection] = sort.split(':') as [MissionSortField, SortDirection]
    const timer = setTimeout(() => {
      fetchMissions({
        keyword: search || undefined,
        skills: selectedSkill ? [selectedSkill] : undefined,
        sortField,
        sortDirection,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedSkill, sort, fetchMissions])

  if (selectedId) {
    return <MissionDetail missionId={selectedId} onBack={() => onSelect(null)} />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* AI-matched recommendations (freelancers only) */}
      {role === 'freelance' && <RecommendedMissions onSelect={onSelect} />}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search missions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-48"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort missions"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
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
          {allSkills.map((skill) => (
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

      {/* Client CTA banner */}
      {role === 'client' && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Need to hire someone?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Post a mission and receive applications from top freelancers.</p>
          </div>
          <CreateMissionModal>
            <Button size="sm" className="gap-1.5 shrink-0 shadow-sm shadow-primary/20">
              <Plus className="w-3.5 h-3.5" />
              Post mission
            </Button>
          </CreateMissionModal>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <p className="text-sm text-muted-foreground">{missions.length} mission{missions.length !== 1 ? 's' : ''} found</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {missions.map((m) => (
          <MissionCard key={m.id} mission={m} onSelect={onSelect} />
        ))}
      </div>

      {loading && missions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Loading missions…</p>
        </div>
      )}

      {!loading && missions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No missions match your filters.</p>
        </div>
      )}
    </div>
  )
}

function MissionCard({ mission: m, onSelect }: { mission: Mission; onSelect: (id: string) => void }) {
  const daysLeft = Math.ceil(
    (new Date(m.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Card
      className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(m.id)}
    >
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {resolvePhotoUrl(m.client.photo) ? (
              <img
                src={resolvePhotoUrl(m.client.photo)!}
                alt={m.client.nom}
                className="w-9 h-9 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-9 h-9 rounded-full border border-border bg-secondary flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
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
        <div className="flex items-center justify-between pt-1 border-t border-border" onClick={(e) => e.stopPropagation()}>
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
          <Button size="sm" className="gap-1.5" onClick={() => onSelect(m.id)}>
            View <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
