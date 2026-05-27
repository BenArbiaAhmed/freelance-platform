import { useEffect, useRef, useState } from 'react'
import { MessageSquare, X, Send, ArrowLeft, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Shapes mirror backend Message entity (contenu, expediteur, lu, dateEnvoi)
interface ChatMessage {
  id: string
  contenu: string
  expediteur: 'me' | 'them'  // simplified; real app uses expediteurId vs current user
  lu: boolean
  dateEnvoi: string
}

interface Conversation {
  id: string               // contratId
  missionTitre: string
  counterpart: { nom: string; photo: string }
  messages: ChatMessage[]
  online: boolean
}

// Mock data matching signed contracts from MY_CONTRATS
const CONVERSATIONS: Conversation[] = [
  {
    id: 'k1',
    missionTitre: 'UX/UI Designer for Mobile App Redesign',
    counterpart: { nom: 'Maria Chen', photo: 'https://i.pravatar.cc/40?img=9' },
    online: true,
    messages: [
      { id: 'm1', contenu: 'Hi Aisha! Welcome aboard. Looking forward to working with you.', expediteur: 'them', lu: true, dateEnvoi: '10:02' },
      { id: 'm2', contenu: 'Thanks Maria! Excited to get started. Should I begin with the design system or the app flows?', expediteur: 'me', lu: true, dateEnvoi: '10:05' },
      { id: 'm3', contenu: 'Let\'s start with the design system — it will unblock everything else.', expediteur: 'them', lu: true, dateEnvoi: '10:08' },
      { id: 'm4', contenu: 'Perfect. I\'ll share the first draft of the colour tokens and typography by tomorrow morning.', expediteur: 'me', lu: false, dateEnvoi: '10:10' },
    ],
  },
  {
    id: 'k2',
    missionTitre: 'GraphQL API Integration Specialist',
    counterpart: { nom: 'Rayan Mansouri', photo: 'https://i.pravatar.cc/40?img=15' },
    online: false,
    messages: [
      { id: 'm5', contenu: 'Great work on the Apollo setup. The subscription part is working perfectly.', expediteur: 'them', lu: true, dateEnvoi: 'Yesterday' },
      { id: 'm6', contenu: 'Happy to hear it! I\'ll push the optimistic UI updates today.', expediteur: 'me', lu: true, dateEnvoi: 'Yesterday' },
    ],
  },
]

export function ChatPopup() {
  const [open, setOpen] = useState(false)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [conversations, setConversations] = useState(CONVERSATIONS)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null
  const totalUnread = conversations.reduce(
    (acc, c) => acc + c.messages.filter((m) => m.expediteur === 'them' && !m.lu).length, 0
  )

  // Auto-scroll to latest message
  useEffect(() => {
    if (open && activeConvId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, activeConvId, conversations])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function sendMessage(convId: string) {
    const text = (drafts[convId] ?? '').trim()
    if (!text) return
    setConversations((prev) =>
      prev.map((c) =>
        c.id !== convId ? c : {
          ...c,
          messages: [...c.messages, {
            id: `m-${Date.now()}`,
            contenu: text,
            expediteur: 'me',
            lu: false,
            dateEnvoi: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }],
        }
      )
    )
    setDrafts((d) => ({ ...d, [convId]: '' }))
  }

  function openConversation(id: string) {
    setActiveConvId(id)
    // Mark all incoming messages as read
    setConversations((prev) =>
      prev.map((c) =>
        c.id !== id ? c : {
          ...c,
          messages: c.messages.map((m) => ({ ...m, lu: true })),
        }
      )
    )
  }

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {/* Popup panel */}
      {open && (
        <div className="w-80 bg-white rounded-2xl border border-border shadow-2xl shadow-black/10 overflow-hidden flex flex-col">
          {activeConv ? (
            /* ── Message thread ── */
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white shrink-0">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative shrink-0">
                  <img src={activeConv.counterpart.photo} alt={activeConv.counterpart.nom} className="w-8 h-8 rounded-full object-cover" />
                  {activeConv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{activeConv.counterpart.nom}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{activeConv.missionTitre}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium shrink-0">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                  Live
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-72">
                {activeConv.messages.map((m) => (
                  <div key={m.id} className={cn('flex', m.expediteur === 'me' ? 'justify-end' : 'justify-start')}>
                    {m.expediteur === 'them' && (
                      <img
                        src={activeConv.counterpart.photo}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover mr-2 self-end shrink-0"
                      />
                    )}
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                        m.expediteur === 'me'
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-secondary text-foreground rounded-bl-sm'
                      )}
                    >
                      {m.contenu}
                      <p className={cn('text-[10px] mt-1', m.expediteur === 'me' ? 'text-white/60 text-right' : 'text-muted-foreground')}>
                        {m.dateEnvoi}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 flex gap-2 shrink-0">
                <input
                  type="text"
                  className="flex-1 text-sm bg-secondary rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
                  placeholder="Type a message…"
                  value={drafts[activeConv.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [activeConv.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(activeConv.id) }}
                />
                <button
                  onClick={() => sendMessage(activeConv.id)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity shrink-0"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* ── Conversation list ── */
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Messages</h2>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="divide-y divide-border">
                {conversations.map((c) => {
                  const last = c.messages[c.messages.length - 1]
                  const unread = c.messages.filter((m) => m.expediteur === 'them' && !m.lu).length
                  return (
                    <li
                      key={c.id}
                      onClick={() => openConversation(c.id)}
                      className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-secondary/40 transition-colors"
                    >
                      <div className="relative shrink-0">
                        <img src={c.counterpart.photo} alt={c.counterpart.nom} className="w-10 h-10 rounded-full object-cover" />
                        {c.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{c.counterpart.nom}</p>
                        <p className="text-xs text-muted-foreground truncate">{last?.contenu}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] text-muted-foreground">{last?.dateEnvoi}</span>
                        {unread > 0 && (
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold">
                            {unread}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="px-4 py-2 border-t border-border">
                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                  WebSocket connected · /messages
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setOpen((v) => !v); setActiveConvId(null) }}
        className="flex items-center justify-center w-13 h-13 w-12 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all relative"
        aria-label="Open chat"
      >
        <MessageSquare className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {totalUnread}
          </span>
        )}
      </button>
    </div>
  )
}
