import { useEffect, useState } from 'react'
import { Star, Search, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FreelancerDetail } from '@/components/dashboard/FreelancerDetail'
import { type FreelanceProfile } from '@/lib/mock-data'
import {
  useFreelancersStore,
  type FreelancerSortField,
  type SortDirection,
} from '@/store/freelancers'
import { cn } from '@/lib/utils'

interface Props {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'RATING:DESC', label: 'Top rated' },
  { value: 'TARIF_JOURNALIER:ASC', label: 'Rate: low to high' },
  { value: 'TARIF_JOURNALIER:DESC', label: 'Rate: high to low' },
  { value: 'NOM:ASC', label: 'Name: A–Z' },
]

export function FreelancersTab({ selectedId, onSelect }: Props) {
  const { freelancers, allSkills, loading, error, fetchFreelancers } = useFreelancersStore()
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sort, setSort] = useState('RATING:DESC')

  // Push every filter/sort change to the GraphQL search query, debounced so
  // typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const [sortField, sortDirection] = sort.split(':') as [FreelancerSortField, SortDirection]
    const timer = setTimeout(() => {
      fetchFreelancers({
        keyword: search || undefined,
        skills: selectedSkill ? [selectedSkill] : undefined,
        disponible: availableOnly || undefined,
        sortField,
        sortDirection,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedSkill, availableOnly, sort, fetchFreelancers])

  if (selectedId) {
    return <FreelancerDetail freelancerId={selectedId} onBack={() => onSelect(null)} />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or bio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="sm:w-48"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort freelancers"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAvailableOnly((v) => !v)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              availableOnly
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-border text-muted-foreground hover:border-primary/40'
            )}
          >
            Available now
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

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <p className="text-sm text-muted-foreground">{freelancers.length} freelancer{freelancers.length !== 1 ? 's' : ''} found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {freelancers.map((f) => (
          <FreelancerCard key={f.id} freelancer={f} onSelect={onSelect} />
        ))}
      </div>

      {loading && freelancers.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Loading freelancers…</p>
        </div>
      )}

      {!loading && freelancers.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No freelancers match your filters.</p>
        </div>
      )}
    </div>
  )
}

function FreelancerCard({ freelancer: f, onSelect }: { freelancer: FreelanceProfile; onSelect: (id: string) => void }) {
  return (
    <Card
      className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(f.id)}
    >
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {f.photo ? (
              <img src={f.photo} alt={f.nom} className="w-12 h-12 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full border border-border bg-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            {f.disponible && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{f.nom}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-foreground">{f.rating}</span>
              <span className="text-xs text-muted-foreground ml-1">
                {f.disponible ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
          <p className="text-sm font-bold text-foreground shrink-0">
            ${f.tarifJournalier}
            <span className="text-xs font-normal text-muted-foreground">/day</span>
          </p>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{f.bio}</p>

        {/* Competences */}
        <div className="flex flex-wrap gap-1.5">
          {f.competences.map((c) => (
            <Badge key={c.nom} variant="secondary" className="text-xs">{c.nom}</Badge>
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-auto"
          onClick={(e) => { e.stopPropagation(); onSelect(f.id) }}
        >
          View profile
        </Button>
      </CardContent>
    </Card>
  )
}
