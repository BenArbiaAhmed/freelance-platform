import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Package,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, apiErrorMessage, resolvePhotoUrl } from '@/lib/api'
import { useChatUiStore } from '@/store/chatUi'
import { cn } from '@/lib/utils'
import type { ContratItem } from '@/store/contrats'

type LivrableStatut = 'pending' | 'validated' | 'rejected'
type ContratStatut = 'draft' | 'signed' | 'completed' | 'cancelled'

interface Livrable {
  id: string
  titre: string
  url: string
  fileName: string | null
  statut: LivrableStatut
  dateDepot: string
}

interface ContractDetailData {
  id: string
  statut: ContratStatut
  cahierDesChargesUrl: string | null
  cahierDesChargesNom: string | null
  livrables: Livrable[]
}

const statusConfig: Record<ContratStatut, { label: string; className: string }> = {
  draft: { label: 'In progress', className: 'bg-sky-50 text-sky-700' },
  signed: { label: 'Active', className: 'bg-sky-50 text-sky-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-600' },
}

const livrableConfig: Record<LivrableStatut, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Awaiting review', icon: Clock, className: 'bg-amber-50 text-amber-700' },
  validated: { label: 'Validated', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-50 text-red-600' },
}

interface Props {
  contract: ContratItem
  role: 'freelance' | 'client'
  onBack: () => void
  onChanged: () => void
}

export function ContractDetail({ contract, role, onBack, onChanged }: Props) {
  const [data, setData] = useState<ContractDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const openChat = useChatUiStore((s) => s.openChat)

  // Silent re-fetch used after mutations — refreshes the data without flipping
  // the whole section back to its loading state.
  const refetch = async () => {
    try {
      const { data } = await api.get<ContractDetailData>(`/contrats/${contract.id}`)
      setData(data)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load contract'))
    }
  }

  useEffect(() => {
    let active = true
    api
      .get<ContractDetailData>(`/contrats/${contract.id}`)
      .then(({ data }) => {
        if (active) setData(data)
      })
      .catch((err) => {
        if (active) setError(apiErrorMessage(err, 'Could not load contract'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [contract.id])

  const status = data?.statut ?? contract.statut
  const cfg = statusConfig[status]
  const counterparty =
    role === 'client'
      ? contract.freelanceNom
      : `${contract.clientNom}${contract.clientEntreprise ? ` · ${contract.clientEntreprise}` : ''}`
  const isClosed = status === 'completed' || status === 'cancelled'

  async function markCompleted() {
    try {
      await api.patch(`/contrats/${contract.id}`, { statut: 'completed' })
      setData((d) => (d ? { ...d, statut: 'completed' } : d))
      onChanged()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update the contract'))
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to contracts
      </button>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Header */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground leading-snug">{contract.missionTitre}</h1>
              <p className="text-sm text-muted-foreground mt-1">with {counterparty}</p>
            </div>
            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full shrink-0', cfg.className)}>
              {cfg.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-base font-semibold text-foreground">${contract.montant.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm text-foreground">
                {new Date(contract.dateCreation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openChat(contract.id)}>
              <MessageSquare className="w-3.5 h-3.5" /> Open chat
            </Button>
            {role === 'client' && !isClosed && (
              <Button size="sm" className="gap-1.5" onClick={markCompleted}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark as completed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground py-4">Loading contract details…</p>
      ) : (
        <>
          <CahierDesChargesCard
            data={data}
            role={role}
            onUploaded={refetch}
            onError={setError}
          />
          <DeliverablesCard
            contratId={contract.id}
            livrables={[...(data?.livrables ?? [])].sort(
              (a, b) => new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime(),
            )}
            role={role}
            isClosed={isClosed}
            onChanged={refetch}
            onError={setError}
          />
        </>
      )}
    </div>
  )
}

// ─── Cahier des charges (spec document) ─────────────────────────────────────

function CahierDesChargesCard({
  data,
  role,
  onUploaded,
  onError,
}: {
  data: ContractDetailData | null
  role: 'freelance' | 'client'
  onUploaded: () => Promise<void> | void
  onError: (msg: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const hasDoc = Boolean(data?.cahierDesChargesUrl)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !data) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/contrats/${data.id}/cahier-des-charges`, form)
      await onUploaded()
    } catch (err) {
      onError(apiErrorMessage(err, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Cahier des charges
          </h2>
          {role === 'client' && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFile}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Uploading…' : hasDoc ? 'Replace' : 'Upload'}
              </Button>
            </>
          )}
        </div>

        {hasDoc ? (
          <a
            href={resolvePhotoUrl(data!.cahierDesChargesUrl) ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-3 hover:bg-secondary transition-colors w-fit"
          >
            <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground truncate max-w-xs">
              {data!.cahierDesChargesNom ?? 'Specification document'}
            </span>
            <Download className="w-4 h-4 text-muted-foreground shrink-0" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            {role === 'client'
              ? 'Upload the project specification (PDF or Word) so the freelancer knows what to deliver.'
              : "The client hasn't shared a specification document yet."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Deliverables ────────────────────────────────────────────────────────────

function DeliverablesCard({
  contratId,
  livrables,
  role,
  isClosed,
  onChanged,
  onError,
}: {
  contratId: string
  livrables: Livrable[]
  role: 'freelance' | 'client'
  isClosed: boolean
  onChanged: () => Promise<void> | void
  onError: (msg: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [titre, setTitre] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actingId, setActingId] = useState<string | null>(null)

  async function submit() {
    if (!titre.trim() || !file) return
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('contratId', contratId)
      form.append('titre', titre.trim())
      await api.post('/livrables', form)
      setTitre('')
      setFile(null)
      await onChanged()
    } catch (err) {
      onError(apiErrorMessage(err, 'Could not submit the deliverable'))
    } finally {
      setSubmitting(false)
    }
  }

  async function setStatus(id: string, statut: LivrableStatut) {
    setActingId(id)
    try {
      await api.patch(`/livrables/${id}`, { statut })
      await onChanged()
    } catch (err) {
      onError(apiErrorMessage(err, 'Could not update the deliverable'))
    } finally {
      setActingId(null)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" /> Deliverables
          <span className="text-xs font-normal text-muted-foreground">({livrables.length})</span>
        </h2>

        {/* Freelancer submission form */}
        {role === 'freelance' && !isClosed && (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-4">
            <Input
              placeholder="Deliverable title (e.g. Homepage design v1)"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => inputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5" /> {file ? 'Change file' : 'Choose file'}
              </Button>
              {file && <span className="text-xs text-muted-foreground truncate max-w-[12rem]">{file.name}</span>}
              <Button
                size="sm"
                className="gap-1.5 ml-auto"
                disabled={submitting || !titre.trim() || !file}
                onClick={submit}
              >
                <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          </div>
        )}

        {livrables.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {role === 'freelance' ? 'No deliverables submitted yet.' : 'The freelancer has not submitted any deliverables yet.'}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {livrables.map((l) => {
              const lc = livrableConfig[l.statut]
              const Icon = lc.icon
              return (
                <li key={l.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <a
                    href={resolvePhotoUrl(l.url) ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary text-muted-foreground hover:text-foreground shrink-0"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{l.titre}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {l.fileName ?? 'file'} · {new Date(l.dateDepot).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </p>
                  </div>

                  {role === 'client' && l.statut === 'pending' && !isClosed ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-emerald-700 hover:text-emerald-700"
                        disabled={actingId === l.id}
                        onClick={() => setStatus(l.id, 'validated')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:text-destructive"
                        disabled={actingId === l.id}
                        onClick={() => setStatus(l.id, 'rejected')}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  ) : (
                    <span className={cn('flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0', lc.className)}>
                      <Icon className="w-3 h-3" /> {lc.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
