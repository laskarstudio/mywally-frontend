'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useBootstrapFamily } from '@/app/lib/hooks/useOnboarding'
import { ApiError } from '@/app/lib/client'

type Step =
  | 'ask_parent_name'
  | 'ask_guardian_name'
  | 'ask_phone'
  | 'ask_relation'
  | 'ask_consent'

type Message = { id: string; variant: 'bot' | 'user'; text: string }

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
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

export default function FamilyPage() {
  const router    = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const { mutateAsync: bootstrapFamily, isPending: isSubmitting } = useBootstrapFamily()

  const [messages,        setMessages]        = useState<Message[]>([])
  const [step,            setStep]            = useState<Step>('ask_parent_name')
  const [isTyping,        setIsTyping]        = useState(false)
  const [parentName,      setParentName]      = useState('')
  const [guardianName,    setGuardianName]    = useState('')
  const [guardianPhone,   setGuardianPhone]   = useState('')
  const [selectedRelation, setSelectedRelation] = useState('')

  const addMsg    = useCallback((variant: 'bot' | 'user', text: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, variant, text }])
  }, [])
  const addBotMsg = useCallback((text: string) => addMsg('bot', text), [addMsg])

  useEffect(() => {
    const t = setTimeout(() => addBotMsg("First, what's your name?"), 400)
    return () => clearTimeout(t)
  }, [addBotMsg])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, step])

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)
  }

  function botReply(text: string, nextStep: Step, delay = 900) {
    setIsTyping(true)
    setTimeout(() => { setIsTyping(false); addBotMsg(text); setStep(nextStep) }, delay)
  }

  function handleParentNameSubmit() {
    const name = parentName.trim()
    if (!name) return
    addMsg('user', name)
    botReply("What's the name of the family member who'll help look after you?", 'ask_guardian_name')
  }

  function handleGuardianNameSubmit() {
    const name = guardianName.trim()
    if (!name) return
    addMsg('user', name)
    botReply('What is their phone number?', 'ask_phone')
  }

  function handlePhoneSubmit() {
    const phone = guardianPhone.trim()
    if (!phone) return
    addMsg('user', phone)
    botReply('What is your relationship with them?', 'ask_relation')
  }

  function handleRelation(rel: string) {
    setSelectedRelation(rel)
    addMsg('user', rel)
    botReply(`Almost done! Do you want to add ${guardianName.trim()} as your trusted family member?`, 'ask_consent')
  }

  async function handleConfirm() {
    addMsg('user', 'Yes, add them')
    setIsTyping(true)
    try {
      await bootstrapFamily({
        parentName:        parentName.trim(),
        guardianName:      guardianName.trim(),
        guardianPhone:     guardianPhone.trim(),
        relationshipLabel: selectedRelation,
      })
      setIsTyping(false)
      addBotMsg('All set! Welcome to Elderly Mode ✅')
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (err) {
      setIsTyping(false)
      const isPhoneErr = err instanceof ApiError && err.status === 400 && err.message.toLowerCase().includes('phone')
      if (isPhoneErr) {
        addBotMsg("That phone number doesn't look right. Please try again with the format 01XXXXXXXX or +60XXXXXXXXX.")
        setGuardianPhone('')
        setStep('ask_phone')
      } else {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        addBotMsg(`${msg} Please try again.`)
        setStep('ask_consent')
      }
    }
  }

  const showParentNameBar   = step === 'ask_parent_name'   && !isTyping
  const showGuardianNameBar = step === 'ask_guardian_name' && !isTyping
  const showPhoneBar        = step === 'ask_phone'         && !isTyping

  return (
    <div className="flex flex-col h-dvh bg-surface">

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.variant === 'user' ? 'justify-end' : 'items-start gap-2.5'}`}>
            {msg.variant === 'bot' && <WallyAvatar />}
            <div className={msg.variant === 'bot'
              ? 'bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]'
              : 'bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[70%]'}>
              <p className={`text-sm leading-relaxed font-medium ${msg.variant === 'user' ? 'text-white' : 'text-foreground'}`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {(isTyping || isSubmitting) && (
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

        {!isTyping && step === 'ask_relation' && (
          <div className="flex flex-wrap gap-2 pl-12">
            {['Children', 'Spouse', 'Sibling', 'Parent', 'Other'].map(rel => (
              <button key={rel} onClick={() => handleRelation(rel)}
                className="px-5 py-2 rounded-full border border-border bg-white text-foreground text-sm font-medium active:bg-surface">
                {rel}
              </button>
            ))}
          </div>
        )}

        {!isTyping && !isSubmitting && step === 'ask_consent' && (
          <div className="pl-12">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-foreground font-medium leading-relaxed mb-3">
                Add <span className="font-bold">{guardianName.trim()}</span> as your trusted family member?
              </p>
              <button onClick={handleConfirm}
                className="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm active:opacity-80">
                Yes, add them
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-border p-4 flex-shrink-0">
        {showParentNameBar ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={parentName}
              onChange={e => setParentName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleParentNameSubmit()}
              onFocus={scrollToBottom}
              placeholder="Your full name"
              autoFocus
              className="flex-1 border border-primary rounded-full px-4 py-2.5 text-sm bg-white outline-none"
            />
            <button onClick={handleParentNameSubmit} disabled={!parentName.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 active:bg-primary-dark disabled:opacity-40">
              <SendIcon />
            </button>
          </div>
        ) : showGuardianNameBar ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={guardianName}
              onChange={e => setGuardianName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuardianNameSubmit()}
              onFocus={scrollToBottom}
              placeholder="Family member's full name"
              autoFocus
              className="flex-1 border border-primary rounded-full px-4 py-2.5 text-sm bg-white outline-none"
            />
            <button onClick={handleGuardianNameSubmit} disabled={!guardianName.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 active:bg-primary-dark disabled:opacity-40">
              <SendIcon />
            </button>
          </div>
        ) : showPhoneBar ? (
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={guardianPhone}
              onChange={e => setGuardianPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              onFocus={scrollToBottom}
              placeholder="e.g. 0138155761"
              autoFocus
              className="flex-1 border border-primary rounded-full px-4 py-2.5 text-sm bg-white outline-none"
            />
            <button onClick={handlePhoneSubmit} disabled={!guardianPhone.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 active:bg-primary-dark disabled:opacity-40">
              <SendIcon />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Type a message..." disabled
              className="flex-1 border border-border rounded-full px-4 py-2.5 text-sm bg-surface text-muted cursor-not-allowed outline-none" />
            <button disabled className="w-10 h-10 rounded-full bg-primary/30 text-white flex items-center justify-center flex-shrink-0 cursor-not-allowed">
              <SendIcon />
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
