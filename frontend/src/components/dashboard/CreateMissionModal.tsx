import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, CheckCircle2 } from 'lucide-react'
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useAuthStore } from '@/store/auth'
import { useMissionsStore } from '@/store/missions'
import { api, apiErrorMessage } from '@/lib/api'

// Mirrors CreateMissionDto (clientId injected server-side from JWT in real app)
const schema = z.object({
  titre: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z
    .string()
    .min(1, 'Required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid budget'),
  deadline: z.string().optional(),
  statut: z.enum(['active', 'draft']),
})
type FormData = z.infer<typeof schema>

const SKILL_SUGGESTIONS = [
  'React', 'TypeScript', 'NestJS', 'Node.js', 'PostgreSQL', 'GraphQL',
  'Docker', 'Figma', 'Python', 'AWS', 'Tailwind CSS', 'Vue.js', 'DevOps',
]

interface Props { children: React.ReactNode }

export function CreateMissionModal({ children }: Props) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const clientId = useAuthStore((s) => s.user?.clientProfile?.id)
  const fetchMissions = useMissionsStore((s) => s.fetchMissions)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { statut: 'active' },
  })

  function addSkill(nom?: string) {
    const s = (nom ?? skillInput).trim()
    if (!s || skills.includes(s)) return
    setSkills((p) => [...p, s])
    setSkillInput('')
  }

  function removeSkill(s: string) {
    setSkills((p) => p.filter((x) => x !== s))
  }

  async function onSubmit(data: FormData) {
    setSubmitError(null)
    if (!clientId) {
      setSubmitError('Only clients can post missions.')
      return
    }
    try {
      await api.post('/missions', {
        clientId,
        titre: data.titre,
        description: data.description,
        budget: Number(data.budget),
        statut: data.statut,
        competencesRequises: skills,
        ...(data.deadline ? { deadline: data.deadline } : {}),
      })
      await fetchMissions()
      setDone(true)
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Could not publish your mission'))
    }
  }

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) { reset(); setSkills([]); setSkillInput(''); setDone(false); setSubmitError(null) }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a new mission</DialogTitle>
          <DialogDescription>Fill in the details below. Freelancers will be able to apply once published.</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Mission published!</p>
              <p className="text-sm text-muted-foreground mt-1">Freelancers can now apply to your mission.</p>
            </div>
            <Button onClick={() => handleOpenChange(false)} variant="outline" className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <Label htmlFor="titre">Mission title</Label>
              <Input id="titre" placeholder="e.g. Senior React Developer for SaaS Dashboard" {...register('titre')} aria-invalid={!!errors.titre} />
              {errors.titre && <p className="mt-1 text-xs text-destructive">{errors.titre.message}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the mission, deliverables, and expectations…"
                className="min-h-[120px]"
                {...register('description')}
                aria-invalid={!!errors.description}
              />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
            </div>

            {/* Budget + Deadline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="budget">Budget (€)</Label>
                <Input id="budget" type="number" min={0} placeholder="e.g. 3500" {...register('budget')} aria-invalid={!!errors.budget} />
                {errors.budget && <p className="mt-1 text-xs text-destructive">{errors.budget.message}</p>}
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" min={today} {...register('deadline')} />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="statut">Publish as</Label>
              <Select id="statut" {...register('statut')}>
                <option value="active">Active — open for applications</option>
                <option value="draft">Draft — save for later</option>
              </Select>
            </div>

            {/* Skills */}
            <div>
              <Label>Required skills</Label>

              {/* Added skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input row */}
              <div className="flex gap-2">
                <Input
                  list="skill-list"
                  placeholder="Type a skill…"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                />
                <datalist id="skill-list">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <Button type="button" variant="outline" size="default" onClick={() => addSkill()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick-add chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 7).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="text-xs px-2.5 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-2 border-t border-border mt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 shadow-md shadow-primary/20" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing…' : 'Publish mission'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
