import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Camera, User, Plus, X, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { useAuthStore } from '@/store/auth'
import { api, apiErrorMessage, API_ORIGIN } from '@/lib/api'


const bioSchema = z.object({
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
})
type BioForm = z.infer<typeof bioSchema>

const freelanceSchema = z.object({
  tarifJournalier: z
    .string()
    .refine((v) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0), 'Enter a valid rate'),
  disponible: z.boolean(),
})
type FreelanceForm = z.infer<typeof freelanceSchema>

const clientSchema = z.object({
  entreprise: z.string().optional(),
  siteWeb: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})
type ClientForm = z.infer<typeof clientSchema>

// ── Skills ────────────────────────────────────────────────────────────────────

const NIVEAUX = [
  { value: 'debutant', label: 'Beginner' },
  { value: 'intermediaire', label: 'Intermediate' },
  { value: 'avance', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const
type Niveau = typeof NIVEAUX[number]['value']

const SUGGESTED_SKILLS = [
  'React', 'TypeScript', 'NestJS', 'Node.js', 'PostgreSQL', 'GraphQL',
  'Docker', 'Figma', 'Python', 'AWS', 'Tailwind CSS', 'Vue.js',
]

interface Skill { id: string; nom: string; niveau: Niveau; competenceId: string }

interface FreelanceCompetenceResp {
  id: string
  freelanceId: string
  competenceId: string
  niveau: Niveau
  competence: { id: string; nom: string; categorie: string | null }
}

interface CompetenceResp { id: string; nom: string; categorie: string | null }

function resolvePhotoUrl(url?: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}

const NIVEAU_COLOR: Record<Niveau, string> = {
  debutant: 'bg-gray-100 text-gray-600',
  intermediaire: 'bg-amber-50 text-amber-700',
  avance: 'bg-sky-50 text-sky-700',
  expert: 'bg-violet-50 text-violet-700',
}

const dotGridUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='%236366f1' fill-opacity='0.18'/%3E%3C/svg%3E")`

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current
              ? 'bg-primary w-8'
              : i === current
              ? 'bg-primary w-8'
              : 'bg-border w-4'
          }`}
        />
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user, loadProfile, completeOnboarding } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role as 'freelance' | 'client' | undefined
  const totalSteps = role === 'freelance' ? 4 : 2
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // ── Photo state ──
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string>(user?.photo ?? '')
  const [photoUploading, setPhotoUploading] = useState(false)

  // ── Resume state (freelance only) ──
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)

  // ── Skills state (freelance only) ──
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkillNom, setNewSkillNom] = useState('')
  const [newSkillNiveau, setNewSkillNiveau] = useState<Niveau>('intermediaire')
  const [skillSaving, setSkillSaving] = useState(false)

  // ── Bio form ──
  const {
    register: regBio,
    handleSubmit: handleBio,
    watch: watchBio,
    formState: { errors: errBio, isSubmitting: subBio },
  } = useForm<BioForm>({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: user?.bio ?? '' },
  })

  // ── Freelance form ──
  const {
    register: regFreelance,
    handleSubmit: handleFreelance,
    watch: watchFreelance,
    setValue: setFreelanceValue,
    formState: { errors: errFreelance, isSubmitting: subFreelance },
  } = useForm<FreelanceForm>({
    resolver: zodResolver(freelanceSchema),
    defaultValues: {
      tarifJournalier: String(user?.freelanceProfile?.tarifJournalier ?? ''),
      disponible: user?.freelanceProfile?.disponible ?? true,
    },
  })
  const disponible = watchFreelance('disponible')

  // ── Client form ──
  const {
    register: regClient,
    handleSubmit: handleClient,
    formState: { errors: errClient, isSubmitting: subClient },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      entreprise: user?.clientProfile?.entreprise ?? '',
      siteWeb: user?.clientProfile?.siteWeb ?? '',
    },
  })

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    const body = new FormData()
    body.append('photo', file)
    try {
      setPhotoUploading(true)
      setError(null)
      const { data } = await api.post<{ photo?: string }>(`/users/${user.id}/photo`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await loadProfile()
      if (data.photo) setPhotoPreview(data.photo)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not upload photo'))
    } finally {
      setPhotoUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  async function onBioSubmit(data: BioForm) {
    setError(null)
    try {
      await api.patch(`/users/${user!.id}`, { bio: data.bio })
      await loadProfile()
      setStep(1)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save bio'))
    }
  }

  async function onFreelanceSubmit(data: FreelanceForm) {
    setError(null)
    try {
      await api.patch(`/freelance-profiles/${user!.freelanceProfile!.id}`, {
        tarifJournalier: data.tarifJournalier ? Number(data.tarifJournalier) : undefined,
        disponible: data.disponible,
      })
      await loadProfile()
      setStep(2)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save profile'))
    }
  }

  async function onResumeUpload() {
    setError(null)
    if (!resumeFile || !user?.freelanceProfile?.id) return
    const body = new FormData()
    body.append('file', resumeFile)
    body.append('freelanceProfileId', user.freelanceProfile.id)
    try {
      setResumeUploading(true)
      await api.post('/resumes', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResumeUploaded(true)
      setStep(3)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not upload CV'))
    } finally {
      setResumeUploading(false)
    }
  }

  async function onClientSubmit(data: ClientForm) {
    setError(null)
    try {
      await api.patch(`/client-profiles/${user!.clientProfile!.id}`, data)
      await loadProfile()
      finish()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save company info'))
    }
  }

  async function addSkill() {
    const nom = newSkillNom.trim()
    if (!nom || skills.some((s) => s.nom.toLowerCase() === nom.toLowerCase())) return
    setSkillSaving(true)
    try {
      const { data: allCompetences } = await api.get<CompetenceResp[]>('/competences')
      const existing = allCompetences.find((c) => c.nom.toLowerCase() === nom.toLowerCase())
      let competenceId: string
      if (existing) {
        competenceId = existing.id
      } else {
        const { data: newComp } = await api.post<CompetenceResp>('/competences', { nom })
        competenceId = newComp.id
      }
      const { data: fc } = await api.post<FreelanceCompetenceResp>('/freelance-competences', {
        freelanceId: user!.freelanceProfile!.id,
        competenceId,
        niveau: newSkillNiveau,
      })
      setSkills((prev) => [...prev, {
        id: fc.id,
        nom: fc.competence?.nom ?? nom,
        niveau: fc.niveau,
        competenceId: fc.competenceId,
      }])
      setNewSkillNom('')
    } catch {
      // silent
    } finally {
      setSkillSaving(false)
    }
  }

  async function removeSkill(skillId: string) {
    setSkills((prev) => prev.filter((s) => s.id !== skillId))
    try {
      await api.delete(`/freelance-competences/${skillId}`)
    } catch { /* optimistic */ }
  }

  function finish() {
    completeOnboarding()
    navigate('/dashboard')
  }

  // ── Render steps ───────────────────────────────────────────────────────────

  const photoUrl = resolvePhotoUrl(photoPreview) || resolvePhotoUrl(user?.photo)

  function StepBio() {
    return (
      <form onSubmit={handleBio(onBioSubmit)} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative group cursor-pointer"
            onClick={() => photoInputRef.current?.click()}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover border border-border shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-secondary border border-border shadow flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {photoUploading
                ? <span className="text-white text-xs font-medium">Uploading…</span>
                : <Camera className="w-5 h-5 text-white" />
              }
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Click to upload a profile photo</p>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="bio">Tell us about yourself</Label>
            <span className="text-xs text-muted-foreground">{watchBio('bio')?.length ?? 0}/500</span>
          </div>
          <Textarea
            id="bio"
            placeholder={
              role === 'freelance'
                ? 'e.g. Full-stack developer with 5 years of experience building SaaS products…'
                : "e.g. We're a product startup looking for talented freelancers to join our team…"
            }
            className="min-h-[120px]"
            {...regBio('bio')}
            aria-invalid={!!errBio.bio}
          />
          {errBio.bio && <p className="mt-1 text-xs text-destructive">{errBio.bio.message}</p>}
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={finish}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
          <Button type="submit" disabled={subBio || photoUploading} className="shadow-md shadow-primary/20">
            {subBio ? 'Saving…' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    )
  }

  function StepFreelanceProfile() {
    return (
      <form onSubmit={handleFreelance(onFreelanceSubmit)} noValidate className="flex flex-col gap-6">
        <div>
          <Label htmlFor="tarifJournalier">Daily rate (€)</Label>
          <Input
            id="tarifJournalier"
            type="number"
            min={0}
            placeholder="e.g. 480"
            {...regFreelance('tarifJournalier')}
            aria-invalid={!!errFreelance.tarifJournalier}
          />
          {errFreelance.tarifJournalier && (
            <p className="mt-1 text-xs text-destructive">{errFreelance.tarifJournalier.message}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">You can update this at any time in your profile settings.</p>
        </div>

        <div>
          <Label>Availability</Label>
          <div className="flex items-center gap-3 mt-1.5">
            <Switch
              checked={disponible}
              onCheckedChange={(v) => setFreelanceValue('disponible', v)}
            />
            <span className={`text-sm font-medium ${disponible ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {disponible ? 'Available for new missions' : 'Not available right now'}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={() => setStep(0)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <Button type="submit" disabled={subFreelance} className="shadow-md shadow-primary/20">
            {subFreelance ? 'Saving…' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>
    )
  }

  function StepResume() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 py-4 border-2 border-dashed border-border rounded-xl bg-secondary/30">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {resumeUploaded ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">{resumeFile?.name} uploaded</span>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">Drop your CV here</p>
              <p className="text-xs text-muted-foreground">PDF, DOC or DOCX · Max 10 MB</p>
            </>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                setResumeFile(e.target.files?.[0] ?? null)
                setResumeUploaded(false)
              }}
            />
            <span className="text-xs text-primary hover:underline font-medium">
              {resumeFile && !resumeUploaded ? resumeFile.name : 'Browse files'}
            </span>
          </label>
        </div>

        <p className="text-xs text-muted-foreground -mt-2">
          We'll automatically extract your skills and experience to improve mission matching. Processing happens in the background.
        </p>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
            <Button
              type="button"
              onClick={() => void onResumeUpload()}
              disabled={!resumeFile || resumeUploading || resumeUploaded}
              className="shadow-md shadow-primary/20"
            >
              {resumeUploading ? 'Uploading…' : 'Upload & continue'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function StepSkills() {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Add skills that describe your expertise. Clients use these to find you for relevant missions.
          </p>
        </div>

        {/* Existing skills */}
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet.</p>
          )}
          {skills.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 shadow-sm"
            >
              <span className="text-sm font-medium text-foreground">{s.nom}</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-medium ${NIVEAU_COLOR[s.niveau]}`}>
                {NIVEAUX.find((n) => n.value === s.niveau)?.label}
              </span>
              <button
                type="button"
                onClick={() => removeSkill(s.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Quick-add chips */}
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_SKILLS.filter((s) => !skills.some((sk) => sk.nom === s)).slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setNewSkillNom(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>

        {/* Add skill row */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              list="skill-suggestions"
              placeholder="e.g. React, Figma, Docker…"
              value={newSkillNom}
              onChange={(e) => setNewSkillNom(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void addSkill() } }}
            />
            <datalist id="skill-suggestions">
              {SUGGESTED_SKILLS.filter((s) => !skills.some((sk) => sk.nom === s)).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <Select
            className="w-36"
            value={newSkillNiveau}
            onChange={(e) => setNewSkillNiveau(e.target.value as Niveau)}
          >
            {NIVEAUX.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </Select>
          <Button type="button" variant="outline" onClick={() => void addSkill()} disabled={skillSaving}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={() => setStep(2)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <Button onClick={finish} className="shadow-md shadow-primary/20">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Finish setup
          </Button>
        </div>
      </div>
    )
  }

  function StepClientProfile() {
    return (
      <form onSubmit={handleClient(onClientSubmit)} noValidate className="flex flex-col gap-6">
        <div>
          <Label htmlFor="entreprise">Company name</Label>
          <Input
            id="entreprise"
            placeholder="e.g. Nexora"
            {...regClient('entreprise')}
            aria-invalid={!!errClient.entreprise}
          />
          {errClient.entreprise && <p className="mt-1 text-xs text-destructive">{errClient.entreprise.message}</p>}
        </div>

        <div>
          <Label htmlFor="siteWeb">Company website</Label>
          <Input
            id="siteWeb"
            type="url"
            placeholder="https://yourcompany.com"
            {...regClient('siteWeb')}
            aria-invalid={!!errClient.siteWeb}
          />
          {errClient.siteWeb && <p className="mt-1 text-xs text-destructive">{errClient.siteWeb.message}</p>}
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button type="button" variant="outline" onClick={() => setStep(0)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <Button type="submit" disabled={subClient} className="shadow-md shadow-primary/20">
            {subClient ? 'Saving…' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Finish setup
              </>
            )}
          </Button>
        </div>
      </form>
    )
  }

  const stepConfig = role === 'freelance'
    ? [
        { title: 'Your profile', subtitle: 'Add a photo and a short bio so clients know who you are.' },
        { title: 'Rate & availability', subtitle: 'Help clients understand your working terms.' },
        { title: 'Upload your CV', subtitle: "We'll extract your skills to improve mission matching." },
        { title: 'Skills & expertise', subtitle: 'Add the technologies and skills you specialize in.' },
      ]
    : [
        { title: 'Your profile', subtitle: 'Add a photo and a short bio so freelancers know who you are.' },
        { title: 'Company details', subtitle: 'Tell freelancers about your company.' },
      ]

  const currentStep = stepConfig[step]

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: dotGridUrl }} aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 font-bold text-xl text-foreground mb-8">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5" />
          </span>
          FreelanceHub
        </div>

        <div className="rounded-2xl border border-border bg-white/80 backdrop-blur-md shadow-xl shadow-black/5 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Step {step + 1} of {totalSteps}
              </span>
              <StepIndicator current={step} total={totalSteps} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{currentStep.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{currentStep.subtitle}</p>
          </div>

          {/* Step content */}
          {step === 0 && StepBio()}
          {step === 1 && role === 'freelance' && StepFreelanceProfile()}
          {step === 1 && role === 'client' && StepClientProfile()}
          {step === 2 && role === 'freelance' && StepResume()}
          {step === 3 && role === 'freelance' && StepSkills()}
        </div>
      </div>
    </div>
  )
}
