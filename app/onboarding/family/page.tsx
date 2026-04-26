"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBootstrapFamily } from "@/app/lib/hooks/useOnboarding";
import { ApiError } from "@/app/lib/client";

type Step =
  | "ask_parent_name"
  | "ask_guardian_name"
  | "ask_phone"
  | "ask_relation"
  | "ask_consent"
  | "done";

type Message = { id: string; variant: "bot" | "user"; text: string };

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function WallyAvatar() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface">
      <Image
        src="/assets/my-wally-chat-profile.png"
        alt="Wally"
        width={40}
        height={40}
      />
    </div>
  );
}

export default function FamilyPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: bootstrapFamily, isPending: isSubmitting } =
    useBootstrapFamily();

  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("ask_parent_name");
  const [isTyping, setIsTyping] = useState(false);
  const [parentName, setParentName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("");

  const addMsg = useCallback((variant: "bot" | "user", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, variant, text },
    ]);
  }, []);
  const addBotMsg = useCallback(
    (text: string) => addMsg("bot", text),
    [addMsg],
  );

  // iOS keyboard fix: lock document scroll and track visual viewport height
  useEffect(() => {
    const doc = document.documentElement;
    doc.style.overflow = "hidden";

    const vv = window.visualViewport;
    const el = containerRef.current;
    if (vv && el) {
      const resize = () => {
        el.style.height = `${vv.height}px`;
      };
      resize();
      vv.addEventListener("resize", resize);
      return () => {
        doc.style.overflow = "";
        vv.removeEventListener("resize", resize);
      };
    }
    return () => {
      doc.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => addBotMsg("First, what's your name?"), 400);
    return () => clearTimeout(t);
  }, [addBotMsg]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, step]);

  useEffect(() => {
    if (isTyping) return;
    if (step === "ask_parent_name" || step === "ask_guardian_name" || step === "ask_phone") {
      inputRef.current?.focus();
    }
  }, [step, isTyping]);

  function scrollToBottom() {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      300,
    );
  }

  function botReply(text: string, nextStep: Step, delay = 900) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMsg(text);
      setStep(nextStep);
    }, delay);
  }

  function handleParentNameSubmit() {
    const name = parentName.trim();
    if (!name) return;
    addMsg("user", name);
    botReply(
      "What's the name of the family member who'll help look after you?",
      "ask_guardian_name",
    );
  }

  function handleGuardianNameSubmit() {
    const name = guardianName.trim();
    if (!name) return;
    addMsg("user", name);
    botReply("What is their phone number?", "ask_phone");
  }

  function handlePhoneSubmit() {
    const phone = guardianPhone.trim();
    if (!phone) return;
    addMsg("user", phone);
    botReply(
      `What is ${guardianName.trim()}'s relationship with you?`,
      "ask_relation",
    );
  }

  function handleRelation(rel: string) {
    setSelectedRelation(rel);
    addMsg("user", rel);
    botReply(
      `Almost done! Do you want to add ${guardianName.trim()} as your trusted family member?`,
      "ask_consent",
    );
  }

  async function handleConfirm() {
    addMsg("user", "Yes, add them");
    setStep("done");
    setIsTyping(true);
    try {
      await bootstrapFamily({
        parentName: parentName.trim(),
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        relationshipLabel: selectedRelation,
      });
      setIsTyping(false);
      addBotMsg("All set! Welcome to Elderly Mode ✅");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setIsTyping(false);
      const isPhoneErr =
        err instanceof ApiError &&
        err.status === 400 &&
        err.message.toLowerCase().includes("phone");
      if (isPhoneErr) {
        addBotMsg(
          "That phone number doesn't look right. Please try again with the format 01XXXXXXXX or +60XXXXXXXXX.",
        );
        setGuardianPhone("");
        setStep("ask_phone");
      } else {
        const msg =
          err instanceof Error ? err.message : "Something went wrong.";
        addBotMsg(`${msg} Please try again.`);
        setStep("ask_consent");
      }
    }
  }

  const showParentNameBar = step === "ask_parent_name" && !isTyping;
  const showGuardianNameBar = step === "ask_guardian_name" && !isTyping;
  const showPhoneBar = step === "ask_phone" && !isTyping;

  return (
    <div ref={containerRef} className="flex flex-col h-dvh bg-surface">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.variant === "user" ? "justify-end" : "items-start gap-2.5"}`}
          >
            {msg.variant === "bot" && <WallyAvatar />}
            <div
              className={
                msg.variant === "bot"
                  ? "bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]"
                  : "bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[70%]"
              }
            >
              <p
                className={`text-sm leading-relaxed font-medium ${msg.variant === "user" ? "text-white" : "text-foreground"}`}
              >
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

        {!isTyping && step === "ask_relation" && (
          <div className="flex flex-wrap gap-2 pl-12">
            {["Children", "Spouse", "Sibling", "Parent", "Other"].map((rel) => (
              <button
                key={rel}
                onClick={() => handleRelation(rel)}
                className="px-5 py-2 rounded-full border border-border bg-white text-foreground text-sm font-medium active:bg-surface"
              >
                {rel}
              </button>
            ))}
          </div>
        )}

        {!isTyping && !isSubmitting && step === "ask_consent" && (
          <div className="pl-12">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-foreground font-medium leading-relaxed mb-3">
                Add <span className="font-bold">{guardianName.trim()}</span> as
                your trusted family member?
              </p>
              <button
                onClick={handleConfirm}
                className="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm active:opacity-80"
              >
                Yes, add them
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-border p-4 flex-shrink-0">
        {(() => {
          const cfg = showParentNameBar
            ? { type: "text" as const, value: parentName,    onChange: setParentName,    onSubmit: handleParentNameSubmit,    placeholder: "Your full name",            inputMode: "text" as const }
            : showGuardianNameBar
            ? { type: "text" as const, value: guardianName,  onChange: setGuardianName,  onSubmit: handleGuardianNameSubmit,  placeholder: "Family member's full name", inputMode: "text" as const }
            : showPhoneBar
            ? { type: "tel"  as const, value: guardianPhone, onChange: setGuardianPhone, onSubmit: handlePhoneSubmit,         placeholder: "e.g. 0138155761",           inputMode: "tel"  as const }
            : null;

          const disabled = !cfg;
          const value    = cfg?.value ?? "";
          const canSend  = !!cfg && value.trim().length > 0;

          return (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type={cfg?.type ?? "text"}
                inputMode={cfg?.inputMode}
                value={value}
                disabled={disabled}
                onChange={(e) => cfg?.onChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && canSend) cfg?.onSubmit(); }}
                onFocus={scrollToBottom}
                placeholder={cfg?.placeholder ?? "Type a message..."}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm outline-none border ${disabled ? "border-border bg-surface text-muted cursor-not-allowed" : "border-primary bg-white"}`}
              />
              <button
                onClick={() => cfg?.onSubmit()}
                disabled={!canSend}
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center flex-shrink-0 ${canSend ? "bg-primary active:bg-primary-dark" : "bg-primary/30 cursor-not-allowed"}`}
              >
                <SendIcon />
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
