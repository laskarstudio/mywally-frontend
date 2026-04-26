'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import StatusBar from '@/app/components/status-bar'
import BottomNav from '@/app/components/bottom-nav'
import ChatActionCard from '@/app/components/chat-action-card'
import { useChat } from '@/app/lib/hooks/useChat'

/* ── Icons ──────────────────────────────────────────────────────────────────── */
function SpendIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function ReceiptIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

const QUICK_ACTIONS = [
  { label: 'How much can I spend today?', Icon: SpendIcon,   bg: 'bg-blue-50' },
  { label: 'Show my spending',            Icon: ChartIcon,   bg: 'bg-green-50' },
  { label: 'Check for scams',             Icon: ShieldIcon,  bg: 'bg-orange-50' },
  { label: 'Show recent transactions',    Icon: ReceiptIcon, bg: 'bg-purple-50' },
]

function WallyAvatar() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface">
      <Image src="/assets/my-wally-chat-profile.png" alt="Wally" width={40} height={40} />
    </div>
  )
}

export default function WallyPage() {
  const [view,      setView]      = useState<'home' | 'chat'>('home')
  const [textInput, setTextInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, isLoading, llmOffline } = useChat()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleQuickAction(label: string) {
    setView('chat')
    sendMessage(label)
  }

  function handleSend() {
    const text = textInput.trim()
    if (!text) return
    setTextInput('')
    setView('chat')
    sendMessage(text)
  }

  /* ── Chat view ──────────────────────────────────────────────────────────── */
  if (view === 'chat') {
    return (
      <div className="flex flex-col h-dvh bg-surface">

        <div className="flex-shrink-0 bg-surface">
          <StatusBar variant="dark" />
        </div>

        {/* LLM offline banner */}
        {llmOffline && (
          <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex-shrink-0">
            <p className="text-accent text-xs font-semibold text-center">
              Chatbot offline — please contact admin
            </p>
          </div>
        )}

        {/* Message list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-4 space-y-4">

          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%]">
                    <p className="text-white text-sm font-medium">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-2.5">
                    <WallyAvatar />
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]">
                      <p className="text-sm text-foreground leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                  {msg.actions.map((action, i) => (
                    <div key={i} className="pl-12">
                      <ChatActionCard action={action} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5">
              <WallyAvatar />
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-border px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-surface rounded-full px-4 py-2.5">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted"
            />
            <button
              onClick={handleSend}
              disabled={!textInput.trim() || isLoading}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-40 flex-shrink-0"
            >
              <SendIcon />
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }

  /* ── Home view ──────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col flex-1 bg-surface">

      <div className="bg-primary rounded-b-[40px] text-white text-center px-6 pb-10 flex-shrink-0">
        <StatusBar variant="light" />
        <p className="text-base mt-3 text-white/80">Hi, I&apos;m Wally.</p>
        <h1 className="text-3xl font-bold leading-snug mt-1">
          How Can I Help<br />You Today?
        </h1>
      </div>

      <div className="flex-shrink-0 flex justify-center -mt-14 mb-4 relative z-10">
        <Image
          src="/assets/my-wally-chat-profile.png"
          alt="Wally"
          width={140}
          height={140}
          className="object-contain drop-shadow-xl"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {QUICK_ACTIONS.map(({ label, Icon, bg }) => (
            <button
              key={label}
              onClick={() => handleQuickAction(label)}
              className={`${bg} rounded-2xl p-4 text-left flex flex-col gap-3 active:opacity-80 transition-opacity min-h-[100px]`}
            >
              <Icon />
              <span className="text-foreground font-semibold text-sm leading-snug">{label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-full px-4 py-3 shadow-sm flex items-center gap-3">
          <input
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted"
          />
          <button
            onClick={handleSend}
            disabled={!textInput.trim()}
            className="text-primary disabled:opacity-40"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
