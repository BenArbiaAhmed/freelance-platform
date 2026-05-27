import { useState } from 'react'
import { ArrowLeft, Calendar, Users, Building2, ExternalLink, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { MISSIONS, FREELANCERS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const applySchema = z.object({
  lettre: z.string().min(50, 'Cover letter must be at least 50 characters'),
  tarifPropose: z
    .string()
    .min(1, 'Required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount'),
})
type ApplyForm = z.infer<typeof applySchema>

const mockApplicants = FREELANCERS.slice(0, 3)

interface Props {
  missionId: string
  onBack: () => void
}

export function MissionDetail({ missionId, onBack }: Props) {
  const mission = MISSIONS.find((m) => m.id === missionId)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplyForm>({ resolver: zodResolver(applySchema) })

  if (!mission) return null

  const daysLeft = Math.ceil(
    (new Date(mission.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  function onSubmit(_data: ApplyForm) {
    // TODO: POST /api/missions/:id/candidatures
    setTimeout(() => setSubmitted(true), 600)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to missions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Title card */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-foreground leading-snug">{mission.titre}</h1>
                <Badge variant="success" className="shrink-0 capitalize">{mission.statut}</Badge>
              </div>

              {/* Client row */}
              <div className="flex items-center gap-3">
                <img
                  src={mission.client.photo ?? `https://i.pravatar.cc/40?u=${mission.client.nom}`}
                  alt={mission.client.nom}
                  className="w-9 h-9 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{mission.client.nom}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    {mission.client.entreprise}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary/60" />
                  Deadline:{' '}
                  <strong className={cn('font-medium', daysLeft <= 7 ? 'text-red-600' : 'text-foreground')}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Passed'}{' '}
                    <span className="font-normal text-muted-foreground">
                      ({new Date(mission.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})
                    </span>
                  </strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary/60" />
                  <strong className="font-medium text-foreground">{mission.candidatureCount}</strong> applicants
                </span>
                <span className="text-xs text-muted-foreground">
                  Posted {new Date(mission.dateCreation).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-foreground">Mission description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{mission.description}</p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardContent className="p-6 flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-foreground">Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {mission.competencesRequises.map((s) => (
                  <Badge key={s} variant="default" className="text-sm px-3 py-1">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent applicants */}
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Recent applicants</h2>
              </div>
              <ul className="divide-y divide-border">
                {mockApplicants.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 px-6 py-4">
                    <div className="relative shrink-0">
                      <img src={f.photo} alt={f.nom} className="w-9 h-9 rounded-full object-cover border border-border" />
                      {f.disponible && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.competences.slice(0, 2).map((c) => c.nom).join(', ')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">${f.tarifJournalier}/day</p>
                      <p className="text-xs text-amber-600">★ {f.rating}</p>
                    </div>
                    <button className="text-xs text-primary hover:underline flex items-center gap-0.5 shrink-0">
                      Profile <ExternalLink className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: budget + apply form ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">

          {/* Budget card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">Mission budget</p>
              <p className="text-4xl font-black text-foreground">${mission.budget.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Fixed price</p>
            </CardContent>
          </Card>

          {/* Apply card */}
          <Card>
            <CardContent className="p-5 flex flex-col gap-4">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Application sent!</p>
                  <p className="text-xs text-muted-foreground">The client will review your proposal and get back to you.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                  <h2 className="text-sm font-semibold text-foreground">Submit your application</h2>

                  <div>
                    <Label htmlFor="tarifPropose">Your rate (€ total)</Label>
                    <Input
                      id="tarifPropose"
                      type="number"
                      placeholder={`e.g. ${Math.round(mission.budget * 0.9)}`}
                      {...register('tarifPropose')}
                      aria-invalid={!!errors.tarifPropose}
                    />
                    {errors.tarifPropose && (
                      <p className="mt-1 text-xs text-destructive">{errors.tarifPropose.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lettre">Cover letter</Label>
                    <Textarea
                      id="lettre"
                      placeholder="Introduce yourself, explain why you're a great fit, and outline your approach…"
                      className="min-h-[140px]"
                      {...register('lettre')}
                      aria-invalid={!!errors.lettre}
                    />
                    {errors.lettre && (
                      <p className="mt-1 text-xs text-destructive">{errors.lettre.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full shadow-md shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending…' : 'Send application'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
