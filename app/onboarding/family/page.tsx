'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useCompleteOnboarding, useCreateFamily } from '@/app/lib/hooks/useOnboarding'
import { setAuth, getUser } from '@/app/lib/auth'
import { ApiError } from '@/app/lib/client'
import { fetchFamilies, loginAsFamily, queryKeys } from '@/app/lib/api'
import type { Family } from '@/app/lib/types'

type Step =
  | 'ask_family'
  | 'ask_account'   // inline login — pick which demo account
  | 'ask_name'
  | 'ask_phone'
  | 'ask_relation'
  | 'ask_consent'
  | 'done_added'
  | 'done_skipped'

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

/* ── Inline account picker (renders inside the chat) ──────────────────────── */
function AccountPicker({
  onSelect,
}: {
  onSelect: (family: Family) => void
}) {
  const { data: families, isLoading, isError } = useQuery({
    queryKey: queryKeys.families(),
    queryFn:  fetchFamilies,
    staleTime: Infinity,
  })

  if (isLoading) {
    return (
      <div className="pl-12 space-y-2">
        {[1, 2].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}
      </div>
    )
  }
  if (isError || !families?.length) {
    return (
      <div className="pl-12">
        <p className="text-danger text-sm font-medium">Could not load accounts. Check your connection.</p>
      </div>
    )
  }

  return (
    <div className="pl-12 space-y-2">
      {families.map(family => (
        <button
          key={family.familyId}
          onClick={() => onSelect(family)}
          className="w-full bg-white rounded-2xl px-4 py-3 shadow-sm border border-border flex items-center gap-3 active:bg-surface transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-sm">{family.parent.fullName.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">{family.parent.fullName}</p>
            {family.guardian && (
              <p className="text-muted text-xs truncate">Guardian: {family.guardian.fullName}</p>
            )}
          </div>
          <span className="text-muted">›</span>
        </button>
      ))}
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function FamilyPage() {
  const router    = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const { mutateAsync: createFamily }  = useCreateFamily()
  const { mutate:  completeOnboarding } = useCompleteOnboarding()

  const [messages,         setMessages]         = useState<Message[]>([])
  const [step,             setStep]             = useState<Step>('ask_family')
  const [isTyping,         setIsTyping]         = useState(false)
  const [nameInput,        setNameInput]        = useState('')
  const [phoneInput,       setPhoneInput]       = useState('')
  const [selectedRelation, setSelectedRelation] = useState('')
  const [isLoggingIn,      setIsLoggingIn]      = useState(false)

  const addMsg    = useCallback((variant: 'bot' | 'user', text: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, variant, text }])
  }, [])
  const addBotMsg = useCallback((text: string) => addMsg('bot', text), [addMsg])

  useEffect(() => {
    const t = setTimeout(() => addBotMsg('Do you want to add a family member to help look after you?'), 400)
    return () => clearTimeout(t)
  }, [addBotMsg])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, step])

  function botReply(text: string, nextStep: Step, delay = 900) {
    setIsTyping(true)
    setTimeout(() => { setIsTyping(false); addBotMsg(text); setStep(nextStep) }, delay)
  }

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  function handleYes() {
    addMsg('user', 'Yes')
    botReply('Great! First, which account is this for?', 'ask_account')
  }
  function handleNo() {
    addMsg('user', 'No')
    botReply('No problem. You can add family members later from your profile.', 'done_skipped')
  }

  async function handleAccountSelect(family: Family) {
    setIsLoggingIn(true)
    try {
      const res = await loginAsFamily(family.parent.id)
      setAuth(res.token, res.user)
      if (typeof window !== 'undefined') {
        localStorage.setItem('mywally_familyId', family.familyId)
      }
      addMsg('user', family.parent.fullName)
      botReply('What is their full name?', 'ask_name')
    } catch {
      addBotMsg("Couldn't log in. Please try another account.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  function handleNameSubmit() {
    const name = nameInput.trim()
    if (!name) return
    addMsg('user', name)
    botReply('What is their phone number?', 'ask_phone')
  }

  function handlePhoneSubmit() {
    const phone = phoneInput.trim()
    if (!phone) return
    addMsg('user', phone)
    botReply('What is your relationship with them?', 'ask_relation')
  }

  function handleRelation(rel: string) {
    setSelectedRelation(rel)
    addMsg('user', rel)
    botReply('Do you agree to share selected financial data with this person?', 'ask_consent')
  }

  function handleDisagree() {
    addMsg('user', "I don't agree")
    botReply('No problem. You can update this later from your profile.', 'done_skipped')
  }

  async function handleAgree() {
    addMsg('user', 'I agree')
    setIsTyping(true)

    const user = getUser()
    try {
      await createFamily({
        parentName:        user?.fullName ?? 'Parent',
        guardianName:      nameInput.trim(),
        guardianPhone:     phoneInput.trim(),
        relationshipLabel: selectedRelation,
      })
      setIsTyping(false)
      addBotMsg('Alright! We have sent an invitation to them ✅')
      setStep('done_added')
    } catch (err) {
      setIsTyping(false)
      const isPhoneErr = err instanceof ApiError && err.status === 400 && err.message.toLowerCase().includes('phone')
      if (isPhoneErr) {
        addBotMsg("That phone number doesn't look right. Try 01XXXXXXXX or +60XXXXXXXXX.")
        setPhoneInput('')
        setStep('ask_phone')
      } else {
        const msg = err instanceof Error ? err.message : 'Something went wrong.'
        addBotMsg(`${msg} Please try again.`)
        setStep('ask_consent')
      }
    }
  }

  function handleProceed() {
    completeOnboarding(undefined, { onSuccess: () => router.push('/dashboard') })
  }

  /* ── Derived flags ────────────────────────────────────────────────────── */
  const isDone       = step === 'done_added' || step === 'done_skipped'
  const showNameBar  = step === 'ask_name'  && !isTyping
  const showPhoneBar = step === 'ask_phone' && !isTyping

  return (
    <div className="flex flex-col flex-1 bg-surface">

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

        {/* Typing indicator */}
        {(isTyping || isLoggingIn) && (
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

        {/* Yes / No */}
        {!isTyping && step === 'ask_family' && messages.length > 0 && (
          <div className="flex justify-end gap-2">
            <button onClick={handleYes} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold active:bg-primary-dark">Yes</button>
            <button onClick={handleNo}  className="px-6 py-2.5 rounded-full border-2 border-primary text-primary text-sm font-semibold bg-white">No</button>
          </div>
        )}

        {/* Inline account picker */}
        {!isTyping && !isLoggingIn && step === 'ask_account' && (
          <AccountPicker onSelect={handleAccountSelect} />
        )}

        {/* Relationship chips */}
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

        {/* Consent card */}
        {!isTyping && step === 'ask_consent' && (
          <div className="pl-12">
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-sm text-foreground font-medium leading-relaxed">
                I agree to share selected financial data with {nameInput.trim() || 'this person'}.
              </p>
              <button onClick={handleAgree}    className="w-full h-11 rounded-xl bg-success text-white font-semibold text-sm active:opacity-80">I agree</button>
              <button onClick={handleDisagree} className="w-full h-11 rounded-xl bg-danger  text-white font-semibold text-sm active:opacity-80">I don&apos;t agree</button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-border p-4 flex-shrink-0">
        {isDone ? (
          <button onClick={handleProceed}
            className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:bg-primary-dark transition-colors">
            Proceed to Dashboard
          </button>
        ) : showNameBar ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              placeholder="e.g. Nur Radhiah"
              autoFocus
              className="flex-1 border border-primary rounded-full px-4 py-2.5 text-sm bg-white outline-none"
            />
            <button onClick={handleNameSubmit} disabled={!nameInput.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 active:bg-primary-dark disabled:opacity-40">
              <SendIcon />
            </button>
          </div>
        ) : showPhoneBar ? (
          <div className="flex items-center gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
              placeholder="e.g. 0138155761 or +60138155761"
              autoFocus
              className="flex-1 border border-primary rounded-full px-4 py-2.5 text-sm bg-white outline-none"
            />
            <button onClick={handlePhoneSubmit} disabled={!phoneInput.trim()}
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
