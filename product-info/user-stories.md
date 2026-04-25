# 🧠 WALLET COMPANION — UX USER

# STORIES (ELDERLY MODE)

# 🟦 MODULE 1: ELDERLY MODE ENTRY &

# TRANSITION

## 🧾 Story 1.1 — Enter Elderly Mode

### User Story

As an elderly user, I want to easily switch to a simpler version of the app, so that I can use it
without confusion.

### Acceptance Criteria

```
● Entry is visible on main wallet home
● User can enter in ≤ 2 taps
● Label is understandable without explanation
● No scrolling required to find entry
```

### UX Copy

```
● Tile label:
“Mode Mudah”
● Subtext (optional):
“Paparan lebih ringkas”
```

### Edge Cases

```
● User taps accidentally → should not auto-switch without confirmation
● User doesn’t understand label → icon must support meaning
```

### Design Notes

```
● Use high contrast tile
● Include icon (👵 / simplified UI symbol)
● Avoid technical terms (“Lite”, “Accessibility Mode”)
```

### Flow

Main Wallet → Tap “Mode Mudah” → Transition Screen

## 🧾 Story 1.2 — Mode Transition Confirmation

### User Story

As an elderly user, I want to understand what will change before entering, so that I feel safe
proceeding.

### Acceptance Criteria

```
● Message ≤ 10 words
● Single primary CTA
● No scrolling required
```

### UX Copy

```
● Title:
“Masuk ke Mod Mudah”
● Description:
“Paparan lebih ringkas & mudah digunakan”
● CTA:
“Masuk”
```

### Edge Cases

```
● User unsure → keep language simple and reassuring
● User taps back → returns safely to wallet
```

### Design Notes

```
● Use calm visual (soft colors)
● Avoid too much explanation
```

### Flow

Tap Mode → Show Transition → Tap “Masuk” → Enter Simplified Home

## 🧾 Story 1.3 — Exit Elderly Mode

### User Story

As an elderly user, I want to exit simplified mode anytime, so that I feel in control.

### Acceptance Criteria

```
● Exit button always visible on home
● Confirmation required before exit
```

### UX Copy

```
● Button:
“Keluar Mod Mudah”
● Confirmation:
“Kembali ke paparan biasa?”
● Actions:
```

```
○ “Batal”
○ “Ya”
```

### Edge Cases

```
● Accidental tap → must confirm
● User confused → keep wording simple
```

### Design Notes

```
● Place at bottom (not primary)
● Use neutral styling
```

### Flow

Simplified Home → Tap Exit → Confirm → Return to Main Wallet

# 🎙 MODULE 2: VOICE COMPANION

## 🧾 Story 2.1 — Ask Question via Voice

### User Story

As an elderly user, I want to ask questions using my voice, so that I don’t need to navigate
menus.

### Acceptance Criteria

```
● Mic button is primary focus
● System shows listening state
● Response displayed within 2–3 seconds
```

```
● Alternative input available
```

### UX Copy

```
● Instruction:
“Tekan dan tanya”
● Listening state:
“Sedang mendengar...”
```

### Edge Cases

```
● Mic permission denied → fallback to buttons
● No speech detected → show retry prompt
● Background noise
```

### Design Notes

```
● Large centered mic button
● Clear visual feedback (animation)
```

### Flow

Home → Tap “Tanya Saya” → Voice Screen → Speak → Response Screen

## 🧾 Story 2.2 — Use Quick Question Buttons

### User Story

As an elderly user, I want simple buttons to ask common questions, so that I can get answers
without speaking.

### Acceptance Criteria

```
● Max 3–4 buttons only
● One tap → immediate response
● Clearly readable text
```

### UX Copy

```
● “Baki saya?”
● “Saya belanja berapa?”
● “Boleh beli ini?”
```

### Edge Cases

```
● User taps repeatedly → avoid duplicate responses
● No data available → show fallback
```

### Design Notes

```
● Buttons large and spaced
● Use conversational tone
```

### Flow

Voice Screen → Tap Quick Question → Response Screen

## 🧾 Story 2.3 — View Simple Response

### User Story

As an elderly user, I want clear and simple answers, so that I can immediately understand my
situation.

### Acceptance Criteria

```
● Response ≤ 2 lines
● No jargon
● Includes actionable info (balance / status)
```

### UX Copy

```
● Positive:
“Masih cukup. Baki RM15 hari ini”
● Warning:
“Baki hampir habis hari ini”
● Overspent:
“Anda sudah lebih bajet hari ini”
```

### Edge Cases

```
● No transactions → “Belum ada perbelanjaan hari ini”
● Zero balance → clear warning
```

### Design Notes

```
● Large text
● High contrast card
```

### Flow

User asks → System processes → Show Response → Return to Home

# 📊 MODULE 3: DAILY CHECK-IN

## 🧾 Story 3.1 — View Daily Summary

### User Story

As an elderly user, I want to see my daily spending summary automatically, so that I understand
my financial status.

### Acceptance Criteria

```
● Always visible on home
● No interaction required
● Updates dynamically
```

### UX Copy

```
● “Hari ini anda belanja RM18”
● Status:
○ 🟢 “Masih dalam bajet”
○ 🟡 “Hampir capai bajet”
○ 🔴 “Melebihi bajet”
```

### Edge Cases

```
● No spending → “Belum belanja hari ini”
● No budget set → prompt setup
```

### Design Notes

```
● Card format
● Use color + icon
```

### Flow

Open Home → See Summary → Passive understanding

## 🧾 Story 3.2 — Receive Feedback

### User Story

As an elderly user, I want encouraging or warning messages, so that I can adjust my behaviour.

### Acceptance Criteria

```
● Tone is supportive
● Message changes based on status
```

### UX Copy

```
● Positive:
“Bagus! Anda ikut bajet hari ini”
● Warning:
“Cuba kurangkan perbelanjaan”
```

### Edge Cases

```
● Avoid negative tone
● Avoid overload of messages
```

### Design Notes

```
● Short messages
● Friendly tone
```

### Flow

System calculates → Display feedback on home

# 💰 MODULE 4: WALLET SIMULATION

## 🧾 Story 4.1 — Set Daily Budget

### User Story

As an elderly user, I want to set a simple daily budget, so that I can manage my spending.

### Acceptance Criteria

```
● Setup ≤ 1 step
● Preset options only
● Can skip or use default
```

### UX Copy

```
● “Berapa bajet harian anda?”
● Buttons:
○ RM20 / RM30 / RM
● CTA:
“Teruskan”
```

### Edge Cases

```
● User skips → default applied
● User confused → highlight recommended option
```

### Design Notes

```
● No typing
● Large buttons
```

### Flow

First entry → Select budget → Enter Home

## 🧾 Story 4.2 — View Balance

### User Story

As an elderly user, I want to always see my remaining balance, so that I know my limit.

### Acceptance Criteria

```
● Visible at top
● Updates instantly
```

### UX Copy

```
● “Baki Hari Ini”
```

### Edge Cases

```
● Zero balance → highlight clearly
```

### Design Notes

```
● Largest text on screen
```

### Flow

Home → Balance always visible

# ➕ MODULE 5: ADD SPENDING

## 🧾 Story 5.1 — Add Spending

### User Story

As an elderly user, I want to quickly record spending, so that I can track my money easily.

### Acceptance Criteria

```
● Completed in ≤ 5 seconds
● Only amount input required
● Immediate save
```

### UX Copy

```
● “Masukkan jumlah”
● Button:
“Simpan”
```

### Edge Cases

```
● Invalid input
● Very large numbers
```

### Design Notes

```
● Numeric keypad
● No categories
```

### Flow

Home → Add → Input → Save → Return Home

## 🧾 Story 5.2 — See Updated Balance

### User Story

As an elderly user, I want to see my updated balance immediately, so that I understand the
impact.

### Acceptance Criteria

```
● Instant update
● Summary refreshed
```

### UX Copy

```
● “Baki dikemaskini”
```

### Edge Cases

```
● System delay → show loading state
```

### Design Notes

```
● Subtle animation for update
```

### Flow

Save → Update → Return Home

# 🛡 MODULE 6: SAFETY NUDGES

## 🧾 Story 6.1 — Detect Risky Spending

### User Story

As an elderly user, I want to be warned before large spending, so that I avoid mistakes.

### Acceptance Criteria

```
● Trigger threshold logic
● Clear warning message
```

### UX Copy

```
● “Jumlah besar. Pastikan ini bukan scam”
```

### Edge Cases

```
● Frequent triggers → avoid fatigue
● False positives
```

### Design Notes

```
● Calm tone
● Not alarming
```

### Flow

Input → Detect → Show Alert

## 🧾 Story 6.2 — Confirm Action

### User Story

As an elderly user, I want to confirm before proceeding, so that I feel safe.

### Acceptance Criteria

```
● Clear choice
● No ambiguity
```

### UX Copy

```
● “Teruskan?”
● Buttons:
○ “Batal”
○ “Teruskan”
```

### Edge Cases

```
● User confused → highlight safe option
```

### Design Notes

```
● Primary vs secondary button clear
```

### Flow

Alert → Choose → Proceed / Cancel

# 🧠 FINAL NOTE FOR YOUR DESIGN TEAM

“Every screen must answer one question only.”
Not:
❌ “What features can we show?”
But:
✅ “What does the user need _right now_ ?”
