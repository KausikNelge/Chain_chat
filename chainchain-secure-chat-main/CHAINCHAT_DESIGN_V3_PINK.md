# Chain Chat — DESIGN.md v3
## Production Fintech UI Direction: White / Pink / Editorial

**IMPORTANT: This file overrides previous visual directions.**

The product is **CHAIN CHAT**.

This is a production banking + payments application.

The current UI is too dark, too boxed-in, and too obviously AI-generated.
The redesign must move toward a **white / warm-white / pink editorial fintech aesthetic** inspired by the visual confidence of modern Indian fintech products.

Reference:
https://slice.bank.in/

**Do NOT copy Slice's identity, logo, wording, exact layouts, illustrations, or assets.**
Extract the UX principles only.

---

# 1. BRAND LOCK

The only product name is:

# CHAIN CHAT

Never display:

- slice
- slice.bank
- Slice Bank
- Slice logo
- Slice card
- Slice footer
- copied Slice marketing text

Search the complete frontend before finishing:

```text
slice
slice.bank
A new bank
new India
```

Any accidental occurrence must be removed.

The visual reference is not the brand.

---

# 2. PRODUCT FEEL

Chain Chat should feel like:

- a serious fintech
- a modern Indian consumer product
- premium but approachable
- extremely simple
- fast
- trustworthy
- slightly playful through color and motion
- technical underneath, not technical on the surface

It should NOT feel like:

- crypto dashboard
- developer console
- AI SaaS
- hackathon demo
- template-generated landing page
- dark mode admin panel
- collection of rounded cards

---

# 3. BIG VISUAL CHANGE

## MOVE FROM

```text
black background
+
purple gradients
+
many dark cards
+
tiny labels
+
generic hero
+
dashboard wall
```

## TO

```text
warm white canvas
+
Chain Chat pink/fuchsia accents
+
large editorial typography
+
asymmetric compositions
+
real product UI as the visual hero
+
full-width sections
+
soft color fields
+
clean dividers
+
large product screenshots
+
purposeful interaction
```

Use color to create sections instead of wrapping every section in a card.

---

# 4. COLOR SYSTEM

Use a restrained brand palette.

### Base

```text
Canvas:        #FCFBF8
Pure white:    #FFFFFF
Ink:           #17131A
Muted ink:     #6F6874
Divider:       #E9E4EA
```

### Brand accent

```text
Primary pink:  #E5007D
Deep pink:     #B80063
Soft pink:     #FCE7F3
```

### Supporting

```text
Positive:      #16845B
Warning:       #A46600
Error:         #C62845
```

Do not turn every surface pink.

Use pink for:

- primary actions
- important numbers
- links
- selected states
- illustrations
- section accents
- payment confirmation
- focus states

---

# 5. TYPOGRAPHY

Use one strong modern typeface:

Preferred:

```text
Inter
Geist
```

Use very strong hierarchy.

Hero:

```text
clamp(4rem, 8vw, 8rem)
```

Section headings:

```text
clamp(3rem, 6vw, 6rem)
```

Body:

```text
17–20px
```

UI labels:

```text
12–14px
```

Do not make every heading enormous.

Large type should be used at major storytelling moments.

---

# 6. NAVIGATION

Avoid the current giant dark floating dashboard navigation.

Use a clean banking navigation.

Desktop:

```text
CHAIN CHAT

Banking     Payments     Activity     Security

                              [Connect wallet]
```

The navigation can sit on the white page with minimal shadow/border.

Use a small pink brand mark.

Do not make navigation look like a crypto exchange.

Mobile:

Use a proper bottom navigation or compact menu.

Prioritize:

```text
Home
Banking
Payments
Activity
```

---

# 7. HERO — STOP MAKING A GENERIC HERO

The current hero looks AI-generated because it is only:

```text
pill
+
giant text
+
small paragraph
+
button
```

Replace that with a PRODUCT HERO.

## Desired composition

White background.

Large statement on the left.

Actual Chain Chat app interface on the right/below.

Example conceptual structure:

```text
-----------------------------------------------------

CHAIN CHAT
Money, without the middleman.

Banking and payments with direct wallet control.

[Open Chain Chat]     [Connect wallet]

                    ┌─────────────────────────┐
                    │  Chain Chat             │
                    │                         │
                    │  Available              │
                    │  12.84 POL              │
                    │                         │
                    │  [Send] [Receive]       │
                    │                         │
                    │  Recent activity        │
                    │  Rahul        -1.5 POL  │
                    └─────────────────────────┘

-----------------------------------------------------
```

That product visual should be an actual component from the application, not an invented static dashboard.

Do not fake financial data inside authenticated product screens.

---

# 8. HERO BACKGROUND

Use subtle pink visual energy.

GOOD:

- soft pink radial field
- oversized abstract circular shape
- subtle gradient wash
- editorial color block
- real product screenshot over a pink surface

BAD:

- neon purple glow
- glass orb
- crypto particles
- floating gradient blobs everywhere
- star field
- animated background noise

The pink should feel like a bank/consumer brand, not a crypto project.

---

# 9. PRODUCT STORYTELLING

Do not build a 3-column feature-card section.

Use large sections.

Recommended homepage structure:

```text
Hero

01 — Banking
Real account experience

02 — Payments
Fast send/receive experience

03 — Your money, clearly
Activity + transaction visibility

04 — Built around your wallet
Self-custody + security

05 — On-chain when you need it
Technical transparency

Footer
```

Each section should have a different visual composition.

---

# 10. BANKING SECTION

The Banking section should feel like a consumer banking app.

Do not lead with chain ID or contract address.

Lead with:

```text
Your money

Available balance
12.84 POL

[Send] [Receive] [Add funds]
```

Then:

```text
Account
0x73A4...92F1

Network
Polygon Amoy

Status
Connected
```

Blockchain details are secondary.

---

# 11. BANKING PRODUCT UI

Replace the current wall of identical cards.

Use an asymmetric composition.

Example:

```text
Large balance panel
        +
Quick actions
        +
Recent activity column
        +
Account details drawer
```

The background remains white.

Use a large white product surface with subtle 1px borders and minimal radius.

The layout itself should create the hierarchy.

---

# 12. PAYMENTS

Payments must be a separate major experience.

Users must instantly understand:

**I am sending money.**

Payments should have:

```text
Send
Receive
Recent payments
```

Only show other actions if the actual product supports them.

---

# 13. SEND PAYMENT UI

Use a premium minimal form.

```text
Send money

            ₹ 1,500

To
Rahul
0x73A4...92F1

Network
Polygon Amoy

[Continue]
```

The amount is the visual focus.

Avoid wrapping every line in a card.

---

# 14. PAYMENT REVIEW

Review should feel like a bank transfer confirmation.

```text
Review payment

₹1,500

To
Rahul
0x73A4...92F1

Network
Polygon Amoy

Estimated fee
REAL VALUE

Total
REAL VALUE

[Cancel]          [Confirm payment]
```

The confirmation action is the strongest button.

---

# 15. PAYMENT PROCESSING

When confirmed, transition to a dedicated state.

```text
Sending payment

₹1,500

Transaction submitted

Confirming on Polygon...

[View transaction]
```

Do not show fake percentages.

Do not use fake countdowns.

Do not immediately claim success.

Use actual transaction state.

---

# 16. PAYMENT SUCCESS — MAJOR UI ELEMENT

This is mandatory.

After the transaction is genuinely confirmed, show a **premium financial success sheet**.

The experience may be inspired by the clarity of payment gateways such as Razorpay, but the design must be original to Chain Chat.

## Desktop

Use a centered modal/sheet on the white page with a very subtle pink wash behind the success icon.

Structure:

```text
┌────────────────────────────────────────────────────┐
│                                                    │
│                    ✓                               │
│                                                    │
│              Payment successful                   │
│                                                    │
│                    ₹1,500                         │
│                                                    │
│                   Sent to Rahul                   │
│                0x73A4...92F1                       │
│                                                    │
│  ───────────────────────────────────────────────   │
│                                                    │
│  Status                Confirmed                   │
│  Network               Polygon Amoy                │
│  Transaction            0x93...E94C                │
│  Time                   10:42 AM                   │
│  Network fee            REAL VALUE                 │
│                                                    │
│  [View transaction]             [Done]             │
│                                                    │
│                 Share receipt                     │
│                                                    │
└────────────────────────────────────────────────────┘
```

Use real transaction data.

---

# 17. SUCCESS SCREEN VISUAL DETAIL

Add professional micro-elements:

### Success mark

A clean circular check.

### Transaction status

```text
Confirmed
```

### Recipient avatar

If a real profile/avatar exists, show it.

Otherwise use a generated initials avatar derived from real recipient information.

### Amount

Large, dominant.

### Receipt reference

Shortened transaction hash.

### Explorer action

```text
View on PolygonScan ↗
```

Use the actual transaction URL.

### Copy controls

```text
Copy transaction ID
```

Show `Copied` feedback.

### Share

If browser/mobile support exists:

```text
Share receipt
```

Do not show a dead button.

---

# 18. SUCCESS MOTION

Use a short sequence:

```text
modal opens
↓
checkmark draws/reveals
↓
amount appears
↓
recipient appears
↓
receipt metadata appears
↓
actions become active
```

Duration:

```text
150–400ms
```

No confetti.

No explosions.

No childish celebration.

This is money.

---

# 19. RECEIPT SHEET

Clicking `View transaction` should open a deeper detail sheet.

Top:

```text
Payment
₹1,500
Confirmed
```

Then:

```text
From
Your wallet

To
Rahul

Network
Polygon Amoy

Transaction
0x93...E94C

Fee
...

Timestamp
...
```

Technical data should be collapsible.

Example:

```text
On-chain details  +
```

This keeps normal users comfortable while giving power users transparency.

---

# 20. ACTIVITY

Use a real financial activity timeline.

Example:

```text
Today

Rahul
Sent money
−₹1,500                         Confirmed

Coffee
Payment
−₹120                           Confirmed

Arjun
Received money
+₹2,000                         Confirmed
```

No giant card surrounding the entire list.

Use dividers and whitespace.

Clicking a transaction opens the detail sheet.

---

# 21. EMPTY ACTIVITY

When no transactions exist:

```text
No activity yet

Your confirmed payments and transfers
will appear here.

[Send your first payment]
```

Do not invent transactions.

---

# 22. QUICK ACTIONS

A real banking interface should have extremely clear high-frequency actions.

Use an action row near balance:

```text
[ Send ]
[ Receive ]
[ Add funds ]
```

Each action gets:

- icon
- label
- hover
- active feedback

No unnecessary secondary controls.

---

# 23. TRUST / SECURITY

Create a real product section:

```text
Your wallet.
Your control.

Chain Chat never needs custody of your assets.

[Actual supported security information]
```

Only claim properties that exist.

Do not invent audits, insurance, encryption certifications, regulatory status, or guarantees.

---

# 24. ON-CHAIN DETAILS

Technical details belong later in the product story.

Example:

```text
On-chain transparency

Network       Polygon Amoy
Chain ID      80002
Contract      0x...
Explorer      View on PolygonScan ↗
```

Use a compact technical panel.

This should feel intentional, not like a developer console.

---

# 25. AI / SMART UI ELEMENTS

Only implement these when the backend/AI capability actually exists.

Potential premium elements:

## Smart activity explanation

On a transaction:

```text
Why did this change?

You sent 1.5 POL to Rahul.
Network fee: 0.002 POL.

[Show details]
```

## Spending insight

```text
Your payments this month

₹12,420

Highest category
Food & dining

View activity →
```

Use real transaction data.

## Command / search

A compact command interface:

```text
⌘ K   Search Chain Chat
```

Possible actions:

```text
Send money
Find transaction
View balance
Open security
```

Only expose commands that actually work.

Do not add an "AI assistant" bubble just because it looks futuristic.

---

# 26. INTERACTION QUALITY

The UI must include real product feedback.

Examples:

### Copy

```text
Copy address
→
Copied
```

### Connect

```text
Connect wallet
→
Connecting...
→
Connected
```

### Send

```text
Confirm payment
→
Confirming...
→
Submitted
→
Confirmed
```

### Errors

```text
Payment failed

REAL ERROR EXPLANATION

[Try again]
```

Use useful messages.

---

# 27. CARDS — MASSIVELY REDUCE THEM

The current UI uses too many rounded cards.

New rule:

**Cards are for grouping important state, not for decorating the page.**

Prefer:

- sections
- whitespace
- dividers
- editorial compositions
- sheets
- modals
- full-width product panels

Avoid:

```text
Card
  Card
    Card
      Card
```

---

# 28. BORDER RADIUS

Do not make everything a 24px rounded rectangle.

Recommended:

```text
Buttons:        999px where pill is appropriate
Inputs:         12–16px
Panels:         18–24px
Major surfaces: 24–32px
```

Use radius intentionally.

---

# 29. SHADOWS

Keep shadows extremely soft.

No floating dark shadows.

A white fintech product should feel mostly flat, with depth created through:

- spacing
- borders
- overlapping product visuals
- color fields
- typography

---

# 30. ILLUSTRATIONS / VISUALS

Do not use generic AI illustrations.

Prefer:

- actual product screenshots
- UI compositions
- carefully art-directed photography
- original abstract shapes
- transaction visualizations
- subtle brand graphics

No stock photos unless they genuinely fit the brand.

---

# 31. FOOTER

Do not show a developer footer full of:

```text
contract
chain ID
E2EE
RPC
```

as the primary visual footer.

Those technical details can exist in an About / Technical section.

The footer should look like a legitimate consumer fintech:

```text
Chain Chat

Banking
Payments
Activity
Security

Help
Privacy
Terms

Polygon Amoy • Testnet
```

Clearly identify Amoy as a testnet.

---

# 32. TESTNET DISCLOSURE

This is important.

The application is currently using Polygon Amoy.

Show a tasteful testnet label such as:

```text
Polygon Amoy · Testnet
```

Do not make it look like a production banking license or real bank account.

Do not claim:

- RBI-regulated bank
- deposit insurance
- legal bank account
- real-world cash custody

unless that is genuinely true.

---

# 33. RESPONSIVE DESIGN

Test:

```text
1440
1280
1024
768
430
390
375
```

Mobile is a separate composition.

Do not merely shrink desktop.

For mobile:

- balance first
- Send/Receive next
- activity next
- details after
- payment modal becomes bottom sheet
- amount field remains dominant

---

# 34. ACCESSIBILITY

Required:

- semantic HTML
- keyboard navigation
- focus indicators
- form labels
- screen-reader labels
- accessible error messages
- sufficient contrast
- reduced motion support
- touch targets

Never use color alone to communicate transaction state.

---

# 35. NO FAKE DATA

Never invent:

- balance
- transactions
- recipients
- payment IDs
- timestamps
- fees
- confirmation count
- account names

When real data is unavailable:

```text
Connect your wallet
```

or:

```text
No transactions yet
```

or a loading state.

---

# 36. PRESERVE FUNCTIONALITY

Before editing the UI:

Inspect:

- routes
- wallet connection
- wallet signing
- transaction submission
- payment status
- API calls
- backend contracts
- data models
- authentication
- existing components

Do not rewrite business logic for cosmetic reasons.

---

# 37. IMPLEMENTATION ORDER

## Phase 1
Remove Slice contamination.

## Phase 2
Create new Chain Chat design tokens.

## Phase 3
Convert global canvas to white/warm-white.

## Phase 4
Create pink visual identity.

## Phase 5
Redesign navigation.

## Phase 6
Redesign homepage as product storytelling.

## Phase 7
Redesign Banking.

## Phase 8
Redesign Payments.

## Phase 9
Implement payment processing states.

## Phase 10
Implement payment success receipt.

## Phase 11
Implement transaction detail sheet.

## Phase 12
Implement activity.

## Phase 13
Responsive/mobile.

## Phase 14
Motion + polish.

## Phase 15
Production audit.

---

# 38. CRITICAL RULE FOR THE AGENT

Do not stop at:

> "The page is modern and polished."

The agent must visually inspect its own result.

After implementation:

1. Run the app.
2. Capture desktop screenshots.
3. Capture mobile screenshots.
4. Compare against this DESIGN.md.
5. Fix obvious spacing/hierarchy/card-density problems.
6. Verify no Slice branding.
7. Verify banking works.
8. Verify payment flow works.
9. Verify payment success sheet works.
10. Verify no fake financial data exists.

---

# 39. MASTER ANTIGRAVITY PROMPT

Paste this after giving the agent this DESIGN.md:

```text
STOP REUSING THE CURRENT DESIGN.

The current result still looks AI-generated:
dark background + purple accents + repeated cards + generic hero.

We are doing a genuine product redesign.

PRODUCT:
CHAIN CHAT

NOT SLICE.

Read DESIGN.md completely.

Use current Slice/Jupiter/Fi/Indian banking UX only as research references.
Do not copy their identity.

New direction:

WHITE / WARM-WHITE / PINK
EDITORIAL FINTECH
PRODUCT-FIRST
REAL BANKING UX
REAL PAYMENT UX
MINIMAL CARD USAGE

I want Chain Chat to look like a serious consumer fintech product,
not a crypto dashboard.

DO THIS:

1. Remove every accidental Slice reference.
2. Replace Slice-looking cards and branding with original Chain Chat UI.
3. Move the site to a white/warm-white canvas.
4. Establish a restrained pink/fuchsia brand system.
5. Replace the generic hero with an actual Chain Chat product composition.
6. Reduce card density dramatically.
7. Use typography, whitespace, dividers and large compositions.
8. Keep Banking as a primary section.
9. Make Payments a separate primary section.
10. Make Send → Review → Confirm → Processing → Success a real flow.
11. After REAL transaction confirmation, show a polished financial success
    sheet inspired by the clarity of modern payment gateways.
12. Success sheet must show REAL amount, recipient, status, network,
    transaction hash, timestamp and fee where available.
13. Add View Transaction / Done / Share Receipt where those actions work.
14. Add transaction detail sheet.
15. Add real pending and failed states.
16. Add polished loading and empty states.
17. Add quick actions for Send / Receive / Add Funds where supported.
18. Keep technical blockchain information secondary.
19. Add tasteful AI/smart UI only where the underlying functionality exists.
20. Never fabricate financial data.
21. Never invent features.
22. Never break wallet, API, contract, auth, payment or transaction logic.
23. Make desktop and mobile feel intentionally designed.
24. Run the application and visually inspect the result before declaring done.

IMPORTANT:

Do not simply change colors.

Recompose the interface.

The current UI has a structural design problem, not only a color problem.

Make it feel like a real fintech product.

FIRST:
audit the existing implementation and tell me what files/components
you will change.

THEN:
implement the redesign.

AFTER IMPLEMENTATION:
run the app and verify the actual UI.
Do not claim completion without checking the rendered result.
```

---

# 40. DEFINITION OF DONE

The result should make someone say:

> "This looks like a real fintech app."

Not:

> "This looks like an AI generated website."

The first visual impression should be:

**Chain Chat → banking → payments → money**

not:

**crypto → blockchain → dashboard → developer tool**

