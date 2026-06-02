import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageSquare, X, Send, ArrowLeft, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { io, type Socket } from 'socket.io-client'
import { api } from '@/lib/api'
import { useContratsStore } from '@/store/contrats'
import { useAuthStore } from '@/store/auth'
import { useChatUiStore } from '@/store/chatUi'

// Shapes mirror backend Message entity (contenu, expediteur, lu, dateEnvoi)
interface ChatMessage {
  id: string
  contenu: string
  expediteur: 'me' | 'them'
  expediteurId: string
  lu: boolean
  dateEnvoi: string
}

interface Conversation {
  id: string
  missionTitre: string
  counterpart: { nom: string; photo: string }
  online: boolean
}

interface BackendMessage {
  id: string
  contenu: string
  expediteurId: string
  lu: boolean
  dateEnvoi: string
  contratId: string
}

export function ChatPopup() {
  const { open, pendingContratId, toggle, close, consumePending } = useChatUiStore()
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [messagesByContract, setMessagesByContract] = useState<Record<string, ChatMessage[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const activeConvRef = useRef<string | null>(null)

  const userId = useAuthStore((s) => s.user?.id)
  const role = useAuthStore((s) => s.user?.role)
  const { contrats, fetchContrats } = useContratsStore()

  useEffect(() => {
    if (!role) return
    if (role === 'client') {
      const clientId = useAuthStore.getState().user?.clientProfile?.id
      if (clientId) fetchContrats({ clientId })
    } else {
      const freelanceId = useAuthStore.getState().user?.freelanceProfile?.id
      if (freelanceId) fetchContrats({ freelanceId })
    }
  }, [role, fetchContrats])

  const conversations = useMemo<Conversation[]>(() => {
    return contrats.map((c) => {
      const name = role === 'client'
        ? c.freelanceNom
        : `${c.clientNom}${c.clientEntreprise ? ` · ${c.clientEntreprise}` : ''}`
      return {
        id: c.id,
        missionTitre: c.missionTitre,
        counterpart: {
          nom: name,
          photo: `https://i.pravatar.cc/40?u=${encodeURIComponent(name)}`,
        },
        online: true,
      }
    })
  }, [contrats, role])

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null
  const totalUnread = Object.values(messagesByContract).reduce(
    (acc, list) => acc + list.filter((m) => m.expediteur === 'them' && !m.lu).length, 0
  )

  // Auto-scroll to latest message
  useEffect(() => {
    if (open && activeConvId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, activeConvId, messagesByContract])

  useEffect(() => {
    activeConvRef.current = activeConvId
  }, [activeConvId])

  useEffect(() => {
    const socket = io('/messages', { path: '/socket.io' })
    socketRef.current = socket

    socket.on('message', (msg: BackendMessage) => {
      setMessagesByContract((prev) => {
        const list = prev[msg.contratId] ?? []
        const mapped: ChatMessage = {
          id: msg.id,
          contenu: msg.contenu,
          expediteurId: msg.expediteurId,
          expediteur: msg.expediteurId === userId ? 'me' : 'them',
          lu: msg.contratId === activeConvRef.current,
          dateEnvoi: new Date(msg.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        return { ...prev, [msg.contratId]: [...list, mapped] }
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    if (activeConvId) socket.emit('join', { contratId: activeConvId })
    return () => {
      if (activeConvId) socket.emit('leave', { contratId: activeConvId })
    }
  }, [activeConvId])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [close])

  function sendMessage(convId: string) {
    const text = (drafts[convId] ?? '').trim()
    if (!text || !userId) return
    socketRef.current?.emit('send', { contratId: convId, expediteurId: userId, contenu: text })
    setDrafts((d) => ({ ...d, [convId]: '' }))
  }

  // An external request (e.g. from the contract page) to open a conversation.
  useEffect(() => {
    if (pendingContratId) {
      void openConversation(pendingContratId)
      consumePending()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingContratId])

  async function openConversation(id: string) {
    setActiveConvId(id)

    if (!messagesByContract[id]) {
      const { data } = await api.get<BackendMessage[]>('/messages', { params: { contratId: id } })
      setMessagesByContract((prev) => ({
        ...prev,
        [id]: data.map((m) => ({
          id: m.id,
          contenu: m.contenu,
          expediteurId: m.expediteurId,
          expediteur: m.expediteurId === userId ? 'me' : 'them',
          lu: true,
          dateEnvoi: new Date(m.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })),
      }))
    } else {
      setMessagesByContract((prev) => ({
        ...prev,
        [id]: (prev[id] ?? []).map((m) => (m.expediteur === 'them' ? { ...m, lu: true } : m)),
      }))
    }
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
                {(messagesByContract[activeConv.id] ?? []).map((m) => (
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
                <button onClick={() => close()} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="divide-y divide-border">
                {conversations.map((c) => {
                  const list = messagesByContract[c.id] ?? []
                  const last = list[list.length - 1]
                  const unread = list.filter((m) => m.expediteur === 'them' && !m.lu).length
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
                        <p className="text-xs text-muted-foreground truncate">{last?.contenu ?? 'No messages yet'}</p>
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
        onClick={() => { toggle(); setActiveConvId(null) }}
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
