'use client'

import { useState } from 'react'
import Image from 'next/image'
import StatusBar from '@/app/components/status-bar'
import BottomNav from '@/app/components/bottom-nav'

type WallyView = 'home' | 'chat'

type ChatMessage = {
  id: string
  role: 'wally' | 'user'
  text: string
  card?: 'progress'
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  )
}

function WallyAvatar() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface">
      <Image src="/assets/my-wally-chat-profile.png" alt="Wally" width={40} height={40} />
    </div>
  )
}

/* Scripted responses per quick action */
const RESPONSES: Record<string, ChatMessage[]> = {
  spending: [
    {
      id: '1', role: 'wally',
      text: 'You have spent RM45.00 today. You still have RM55.00 left of your daily budget.',
    },
    { id: '2', role: 'wally', text: '', card: 'progress' },
    { id: '3', role: 'wally', text: 'Great job! You are staying within your budget.' },
  ],
  budget: [
    { id: '1', role: 'wally', text: 'Your daily budget is RM100. You have spent RM45 and have RM55 remaining.' },
    { id: '2', role: 'wally', text: '', card: 'progress' },
  ],
  scams: [
    { id: '1', role: 'wally', text: 'Stay safe! Never share your PIN or OTP with anyone, even if they claim to be from the bank.' },
    { id: '2', role: 'wally', text: 'If someone asks for your password or OTP, hang up immediately and call your bank.' },
  ],
  transactions: [
    { id: '1', role: 'wally', text: "Here are your recent transactions today:" },
    { id: '2', role: 'wally', text: '• RM15.00 — Grab Food\n• RM12.00 — Petrol\n• RM18.00 — Supermarket' },
    { id: '3', role: 'wally', text: 'Total spent: RM45.00 of your RM100.00 daily budget.' },
  ],
}

const QUICK_ACTIONS = [
  { key: 'budget', label: 'How much can I spend today?', icon: '💳', bg: 'bg-blue-50' },
  { key: 'spending', label: 'Show my spending', icon: '📊', bg: 'bg-green-50' },
  { key: 'scams', label: 'Check for scams', icon: '🛡️', bg: 'bg-orange-50' },
  { key: 'transactions', label: 'Show recent transactions', icon: '💰', bg: 'bg-purple-50' },
]

function ProgressCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border mt-2">
      <p className="text-accent font-bold text-sm mb-3">Today&apos;s Progress</p>
      <div className="flex justify-between text-sm text-foreground font-medium mb-2">
        <span>RM45 spent</span>
        <span>RM100 budget</span>
      </div>
      <div className="h-3 rounded-full bg-surface overflow-hidden">
        <div className="h-full rounded-full bg-success" style={{ width: '45%' }} />
      </div>
    </div>
  )
}

export default function WallyPage() {
  const [view, setView] = useState<WallyView>('home')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userQuery, setUserQuery] = useState('')
  const [textInput, setTextInput] = useState('')

  function handleQuickAction(key: string, label: string) {
    setUserQuery(label)
    const responses = RESPONSES[key] || [{ id: '1', role: 'wally' as const, text: "I'm working on that for you!" }]
    setChatMessages(responses)
    setView('chat')
  }

  function handleBack() {
    setView('home')
    setChatMessages([])
    setUserQuery('')
    setTextInput('')
  }

  if (view === 'chat') {
    return (
      <div className="flex flex-col flex-1 bg-surface">

        <div className="bg-white border-b border-border flex-shrink-0">
          <StatusBar variant="dark" />
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={handleBack} className="text-foreground p-1 -ml-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <WallyAvatar />
            <div>
              <p className="text-sm font-semibold text-foreground">Wally</p>
              <p className="text-xs text-success">Online</p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {/* User query bubble */}
          <div className="flex justify-end">
            <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%]">
              <p className="text-white text-sm font-medium">{userQuery}</p>
            </div>
          </div>

          {/* Wally responses */}
          {chatMessages.map(msg => (
            <div key={msg.id}>
              {msg.card === 'progress' ? (
                <div className="pl-12"><ProgressCard /></div>
              ) : msg.text ? (
                <div className="flex items-start gap-2.5">
                  <WallyAvatar />
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line font-medium">{msg.text}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="bg-white border-t border-border p-4 flex-shrink-0">
          <div className="flex items-center gap-3 bg-surface rounded-full px-4 py-3">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted"
            />
            <MicIcon />
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">

      {/* Purple header */}
      <div className="bg-primary rounded-b-[40px] text-white text-center px-6 pb-6 flex-shrink-0">
        <StatusBar variant="light" />
        <p className="text-base mt-4 text-white/80">Hi, I&apos;m Wally.</p>
        <h1 className="text-3xl font-bold leading-snug mt-1">
          How Can I Help<br />You Today?
        </h1>
        <div className="flex justify-center mt-4 mb-[-24px]">
          <Image
            src="/assets/my-wally-chat-profile.png"
            alt="Wally"
            width={100}
            height={100}
            className="drop-shadow-xl"
          />
        </div>
      </div>

      {/* Quick actions grid */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface px-4 pt-10 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ key, label, icon, bg }) => (
            <button
              key={key}
              onClick={() => handleQuickAction(key, label)}
              className={`${bg} rounded-2xl p-4 text-left flex flex-col gap-3 active:opacity-80 transition-opacity`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-foreground font-semibold text-sm leading-snug">{label}</span>
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="mt-4 flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-sm">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted"
          />
          <MicIcon />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
