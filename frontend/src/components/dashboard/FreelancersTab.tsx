import { useState } from 'react'
import { Star, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { FREELANCERS, type FreelanceProfile } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const ALL_SKILLS = Array.from(new Set(FREELANCERS.flatMap((f) => f.competences.map((c) => c.nom))))

export function FreelancersTab() {
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [availableOnly, setAvailableOnly] = useState(false)

  const filtered = FREELANCERS.filter((f) => {
    const matchesSearch =
      search === '' ||
      f.nom.toLowerCase().includes(search.toLowerCase()) ||
      f.competences.some((c) => c.nom.toLowerCase().includes(search.toLowerCase()))
    const matchesSkill = !selectedSkill || f.competences.some((c) => c.nom === selectedSkill)
    const matchesAvail = !availableOnly || f.disponible
    return matchesSearch && matchesSkill && matchesAvail
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search freelancers or skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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

      <p className="text-sm text-muted-foreground">{filtered.length} freelancer{filtered.length !== 1 ? 's' : ''} found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((f) => <FreelancerCard key={f.id} freelancer={f} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No freelancers match your filters.</p>
        </div>
      )}
    </div>
  )
}

function FreelancerCard({ freelancer: f }: { freelancer: FreelanceProfile }) {
  return (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img src={f.photo} alt={f.nom} className="w-12 h-12 rounded-full object-cover border border-border" />
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
          <p className="text-sm font-bold text-foreground shrink-0">${f.tarifJournalier}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
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
        <Button variant="outline" size="sm" className="w-full mt-auto">
          View profile
        </Button>
      </CardContent>
    </Card>
  )
}
