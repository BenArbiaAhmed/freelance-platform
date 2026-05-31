import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Plus, X, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/store/auth'
import { api, apiErrorMessage } from '@/lib/api'

// ─── Schemas (mirror backend DTOs) ──────────────────────────────────────────

const personalSchema = z.object({
  nom: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  photo: z.string().url('Enter a valid URL').optional().or(z.literal('')),
})
type PersonalForm = z.infer<typeof personalSchema>

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

const securitySchema = z
  .object({
    motDePasseActuel: z.string().min(1, 'Current password is required'),
    motDePasse: z.string().min(6, 'New password must be at least 6 characters'),
    confirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    message: "Passwords don't match",
    path: ['confirmation'],
  })
type SecurityForm = z.infer<typeof securitySchema>

// ─── NiveauCompetence enum (mirrors backend) ─────────────────────────────────
const NIVEAUX = [
  { value: 'debutant', label: 'Beginner' },
  { value: 'intermediaire', label: 'Intermediate' },
  { value: 'avance', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const
type Niveau = typeof NIVEAUX[number]['value']

const NIVEAU_COLOR: Record<Niveau, string> = {
  debutant: 'bg-gray-100 text-gray-600',
  intermediaire: 'bg-amber-50 text-amber-700',
  avance: 'bg-sky-50 text-sky-700',
  expert: 'bg-violet-50 text-violet-700',
}

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

interface CompetenceResp {
  id: string
  nom: string
  categorie: string | null
}

// ─── Saved banner ────────────────────────────────────────────────────────────
function SavedBanner() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
    </span>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return <span className="text-xs text-destructive">{message}</span>
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
interface Props { role: 'freelance' | 'client' }

export function ProfileTab({ role }: Props) {
  const { user, loadProfile } = useAuthStore()

  const [photoPreview, setPhotoPreview] = useState(user?.photo ?? '')
  const [personalSaved, setPersonalSaved] = useState(false)
  const [personalError, setPersonalError] = useState<string | null>(null)
  const [roleSaved, setRoleSaved] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [securitySaved, setSecuritySaved] = useState(false)
  const [securityError, setSecurityError] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeSaved, setResumeSaved] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)

  // ── Skills state (freelance only) ──
  const [skills, setSkills] = useState<Skill[]>([])
  const [newSkillNom, setNewSkillNom] = useState('')
  const [newSkillNiveau, setNewSkillNiveau] = useState<Niveau>('intermediaire')

  // Load freelance competences from backend
  useEffect(() => {
    if (role !== 'freelance' || !user?.freelanceProfile?.id) return
    api.get<FreelanceCompetenceResp[]>('/freelance-competences')
      .then(({ data }) => {
        const mySkills = data
          .filter((fc) => fc.freelanceId === user.freelanceProfile!.id)
          .map((fc) => ({
            id: fc.id,
            nom: fc.competence.nom,
            niveau: fc.niveau,
            competenceId: fc.competenceId,
          }))
        setSkills(mySkills)
      })
      .catch(() => {})
  }, [role, user?.freelanceProfile?.id])

  // ─── Personal info form ───────────────────────────────────────────────────
  const {
    register: regPersonal,
    handleSubmit: handlePersonal,
    watch: watchPersonal,
    formState: { errors: errPersonal, isSubmitting: subPersonal },
  } = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      nom: user?.nom ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? '',
      photo: user?.photo ?? '',
    },
  })

  const watchedPhoto = watchPersonal('photo')

  async function onPersonalSubmit(data: PersonalForm) {
    setPersonalError(null)
    try {
      await api.patch(`/users/${user!.id}`, data)
      await loadProfile()
      setPersonalSaved(true)
    } catch (err) {
      setPersonalError(apiErrorMessage(err, 'Could not save personal info'))
    }
  }

  // ─── Freelance profile form ───────────────────────────────────────────────
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

  async function onFreelanceSubmit(data: FreelanceForm) {
    setRoleError(null)
    try {
      await api.patch(`/freelance-profiles/${user!.freelanceProfile!.id}`, {
        tarifJournalier: data.tarifJournalier ? Number(data.tarifJournalier) : undefined,
        disponible: data.disponible,
      })
      await loadProfile()
      setRoleSaved(true)
    } catch (err) {
      setRoleError(apiErrorMessage(err, 'Could not save freelance profile'))
    }
  }

  async function onResumeUpload(event: React.FormEvent) {
    event.preventDefault()
    setResumeError(null)
    setResumeSaved(false)
    if (!resumeFile || !user?.freelanceProfile?.id) return

    const body = new FormData()
    body.append('file', resumeFile)
    body.append('freelanceProfileId', user.freelanceProfile.id)

    try {
      setResumeUploading(true)
      await api.post('/resumes', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResumeSaved(true)
      setResumeFile(null)
    } catch (err) {
      setResumeError(apiErrorMessage(err, 'Could not upload resume'))
    } finally {
      setResumeUploading(false)
    }
  }

  // ─── Client profile form ──────────────────────────────────────────────────
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

  async function onClientSubmit(data: ClientForm) {
    setRoleError(null)
    try {
      await api.patch(`/client-profiles/${user!.clientProfile!.id}`, data)
      await loadProfile()
      setRoleSaved(true)
    } catch (err) {
      setRoleError(apiErrorMessage(err, 'Could not save company profile'))
    }
  }

  // ─── Security form ────────────────────────────────────────────────────────
  const {
    register: regSecurity,
    handleSubmit: handleSecurity,
    reset: resetSecurity,
    formState: { errors: errSecurity, isSubmitting: subSecurity },
  } = useForm<SecurityForm>({ resolver: zodResolver(securitySchema) })

  async function onSecuritySubmit(data: SecurityForm) {
    setSecurityError(null)
    try {
      await api.patch(`/users/${user!.id}`, { motDePasse: data.motDePasse })
      setSecuritySaved(true)
      resetSecurity()
    } catch (err) {
      setSecurityError(apiErrorMessage(err, 'Could not update password'))
    }
  }

  // ─── Skill helpers ────────────────────────────────────────────────────────
  async function addSkill() {
    const nom = newSkillNom.trim()
    if (!nom || skills.some((s) => s.nom.toLowerCase() === nom.toLowerCase())) return

    try {
      // Find or create the competence
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
      // silent — could add inline error if needed
    }
  }

  async function removeSkill(skillId: string) {
    setSkills((prev) => prev.filter((s) => s.id !== skillId))
    try {
      await api.delete(`/freelance-competences/${skillId}`)
    } catch {
      // optimistic removal — backend may already be gone
    }
  }

  async function changeSkillNiveau(skillId: string, niveau: Niveau) {
    setSkills((prev) => prev.map((s) => s.id === skillId ? { ...s, niveau } : s))
    try {
      await api.patch(`/freelance-competences/${skillId}`, { niveau })
    } catch {
      // silent
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10">

      {/* ── Avatar header ── */}
      <div className="flex items-center gap-5">
        <div className="relative group shrink-0">
          <img
            src={watchedPhoto || photoPreview || 'https://i.pravatar.cc/120?img=47'}
            alt="Profile"
            className="w-20 h-20 rounded-2xl object-cover border border-border shadow-sm"
            onError={() => setPhotoPreview('https://i.pravatar.cc/120?img=47')}
          />
          <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{user?.nom ?? ''}</h1>
          <p className="text-sm text-muted-foreground capitalize mt-0.5">{role === 'freelance' ? 'Freelancer' : 'Client'}</p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-border" />

      {/* ── Personal information ── */}
      <Section title="Personal information" description="Your public identity on FreelanceHub. Visible to clients and freelancers.">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handlePersonal(onPersonalSubmit)} noValidate className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nom">Full name</Label>
                  <Input id="nom" {...regPersonal('nom')} aria-invalid={!!errPersonal.nom} />
                  {errPersonal.nom && <p className="mt-1 text-xs text-destructive">{errPersonal.nom.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...regPersonal('email')} aria-invalid={!!errPersonal.email} />
                  {errPersonal.email && <p className="mt-1 text-xs text-destructive">{errPersonal.email.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="photo">Profile photo URL</Label>
                <Input id="photo" placeholder="https://…" {...regPersonal('photo')} aria-invalid={!!errPersonal.photo} />
                {errPersonal.photo && <p className="mt-1 text-xs text-destructive">{errPersonal.photo.message}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Paste a direct image URL. The preview above updates live.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="bio" className="mb-0">Bio</Label>
                  <span className="text-xs text-muted-foreground">{watchPersonal('bio')?.length ?? 0}/500</span>
                </div>
                <Textarea
                  id="bio"
                  placeholder="A short description of yourself…"
                  className="min-h-[100px]"
                  {...regPersonal('bio')}
                  aria-invalid={!!errPersonal.bio}
                />
                {errPersonal.bio && <p className="mt-1 text-xs text-destructive">{errPersonal.bio.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border">
                {personalSaved && <SavedBanner />}
                {personalError && <ErrorBanner message={personalError} />}
                <Button
                  type="submit"
                  size="sm"
                  disabled={subPersonal}
                  className="ml-auto shadow-sm shadow-primary/20"
                  onClick={() => setPersonalSaved(false)}
                >
                  {subPersonal ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Section>

      <div className="border-t border-border" />

      {/* ── Role-specific section ── */}
      {role === 'freelance' ? (
        <Section
          title="Freelancer profile"
          description="Details visible to clients."
        >
          <div className="flex flex-col gap-4">
            {/* Rate + availability */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleFreelance(onFreelanceSubmit)} noValidate className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>

                    <div className="flex flex-col justify-end gap-2">
                      <Label>Availability</Label>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={disponible}
                          onCheckedChange={(v) => setFreelanceValue('disponible', v)}
                        />
                        <span className={`text-sm font-medium ${disponible ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {disponible ? 'Available for new missions' : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    {roleSaved && <SavedBanner />}
                    {roleError && <ErrorBanner message={roleError} />}
                    <Button
                      type="submit"
                      size="sm"
                      disabled={subFreelance}
                      className="ml-auto shadow-sm shadow-primary/20"
                      onClick={() => setRoleSaved(false)}
                    >
                      {subFreelance ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Resume upload */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={onResumeUpload} className="flex flex-col gap-4" noValidate>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Resume</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload your latest resume so clients can review your profile faster.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="resume">Resume file</Label>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                    />
                    {resumeFile && (
                      <p className="text-xs text-muted-foreground">Selected: {resumeFile.name}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    {resumeSaved && <SavedBanner />}
                    {resumeError && <ErrorBanner message={resumeError} />}
                    <Button
                      type="submit"
                      size="sm"
                      disabled={resumeUploading || !resumeFile}
                      className="ml-auto shadow-sm shadow-primary/20"
                    >
                      {resumeUploading ? 'Uploading…' : 'Upload resume'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Skills manager */}
            <Card>
              <CardContent className="p-6 flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Skills & expertise</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add or remove skills. Synced with the backend.
                  </p>
                </div>

                {/* Existing skills */}
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 shadow-sm"
                    >
                      <span className="text-sm font-medium text-foreground">{s.nom}</span>
                      <select
                        value={s.niveau}
                        onChange={(e) => changeSkillNiveau(s.id, e.target.value as Niveau)}
                        className={`text-xs rounded-full px-1.5 py-0.5 font-medium border-0 outline-none cursor-pointer ${NIVEAU_COLOR[s.niveau]}`}
                      >
                        {NIVEAUX.map((n) => (
                          <option key={n.value} value={n.value}>{n.label}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSkill(s.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${s.nom}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )}
                </div>

                {/* Add skill input */}
                <div className="flex flex-col gap-3 pt-3 border-t border-border">
                  <Label>Add a skill</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        list="skill-suggestions"
                        placeholder="e.g. React, Figma, Docker…"
                        value={newSkillNom}
                        onChange={(e) => setNewSkillNom(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
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
                    <Button type="button" size="default" variant="outline" onClick={addSkill}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quick-add chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS.filter((s) => !skills.some((sk) => sk.nom === s)).slice(0, 6).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setNewSkillNom(s); }}
                        className="text-xs px-2.5 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      ) : (
        <Section
          title="Company profile"
          description="Details about your company. Visible to freelancers viewing your missions."
        >
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleClient(onClientSubmit)} noValidate className="flex flex-col gap-5">
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

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  {roleSaved && <SavedBanner />}
                  {roleError && <ErrorBanner message={roleError} />}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={subClient}
                    className="ml-auto shadow-sm shadow-primary/20"
                    onClick={() => setRoleSaved(false)}
                  >
                    {subClient ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Section>
      )}

      <div className="border-t border-border" />

      {/* ── Security ── */}
      <Section
        title="Security"
        description="Update your password. We recommend using a unique, strong password."
      >
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSecurity(onSecuritySubmit)} noValidate className="flex flex-col gap-5">
              <div>
                <Label htmlFor="motDePasseActuel">Current password</Label>
                <Input
                  id="motDePasseActuel"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...regSecurity('motDePasseActuel')}
                  aria-invalid={!!errSecurity.motDePasseActuel}
                />
                {errSecurity.motDePasseActuel && (
                  <p className="mt-1 text-xs text-destructive">{errSecurity.motDePasseActuel.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motDePasse">New password</Label>
                  <Input
                    id="motDePasse"
                    type="password"
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    {...regSecurity('motDePasse')}
                    aria-invalid={!!errSecurity.motDePasse}
                  />
                  {errSecurity.motDePasse && (
                    <p className="mt-1 text-xs text-destructive">{errSecurity.motDePasse.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmation">Confirm new password</Label>
                  <Input
                    id="confirmation"
                    type="password"
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    {...regSecurity('confirmation')}
                    aria-invalid={!!errSecurity.confirmation}
                  />
                  {errSecurity.confirmation && (
                    <p className="mt-1 text-xs text-destructive">{errSecurity.confirmation.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border">
                {securitySaved && <SavedBanner />}
                {securityError && <ErrorBanner message={securityError} />}
                <Button
                  type="submit"
                  size="sm"
                  disabled={subSecurity}
                  className="ml-auto shadow-sm shadow-primary/20"
                  onClick={() => setSecuritySaved(false)}
                >
                  {subSecurity ? 'Updating…' : 'Update password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Section>

      {/* bottom spacing */}
      <div className="h-4" />
    </div>
  )
}
