# Design System — Direction B: "Aurora" (dark modern developer)

## Product context
Personal portfolio website of a software engineer who builds internal tools and automation for an
electronics manufacturing (EMS) company: web platforms, ERP (SAP Business One) integrations,
warehouse scanner apps, label printing, BOM processing. Static site (Astro, GitHub Pages).
Bilingual: Polish (default) and English — a PL/EN switch is always visible in the nav.

Audience and jobs-to-be-done (equal priority):
- Recruiter / tech lead: "In 30 seconds, tell me who this is, what stack, what level — and let me download the CV."
- Business client (manufacturing company): "Show me this person solves problems like mine, with measurable results — and how to start working together."

Key pages: Home (one long page), Projects list, Case study detail (/projekty/[slug]), 404.
Home sections in order: Hero → Selected projects → Experience → Skills → Collaboration (services) → Contact.

Content rules:
- Company projects are ANONYMOUS case studies: no company names, no real screenshots. Visuals are
  diagrams or abstract UI mockups.
- Every project card shows ONE concrete result metric (e.g. "−70% czasu przygotowania BOM").
- Two primary CTAs: "Pobierz CV" (recruiter) and "Porozmawiajmy o projekcie" (client).
- Owner name placeholder: "Imię Nazwisko".

## Visual style (library style: "Animated Aurora Background Hero — Dark Developer-Tool")
- Canvas: near-black #07080a. Everything except the aurora is strictly neutral: #ffffff text,
  #9c9c9d muted text, hairline borders rgba(255,255,255,0.08–0.12).
- Signature: a LIVING WARM AURORA behind the hero only — soft-focus diagonal light-blades glowing
  crimson #ff2f3a → coral #ff6b4a → amber #ffb347, fading into #07080a, pure-CSS drift/breathe loops
  (15–22s), SVG feTurbulence film grain + vignette. Below the hero the aurora appears only as faint
  warm glows behind section headings. STRICTLY WARM — never purple/indigo/violet.
- Typography: ONE typeface, Inter, hierarchy by size + weight. H1 64px / 600 / lh 1.1 white with
  exactly ONE word in an amber→coral→crimson text gradient. Section H2 40px / 600. Body 16–18px / 400
  muted white. GeistMono ONLY for small captions, tech tags, years and keyboard-shortcut chips (12px #9c9c9d).
- Floating pill nav: dark translucent backdrop-blurred rounded container, 1px hairline border, faint
  inner-top highlight, centered near the top (not full width). Left: small warm diamond glyph + name.
  Center: muted links (Projekty, Doświadczenie, Umiejętności, Współpraca, Kontakt). Right: PL/EN
  segmented switch + small near-white "Pobierz CV" pill.
- Buttons: primary CTAs are tactile KEYCAP-RAISED — #e6e6e6 fill, #2f3031 text, 8px radius, layered
  shadow stack (2px black ring + soft white outer glow + inset top-white/bottom-dark highlights).
  Secondary: ghost pill (transparent, thin ring border, muted text, trailing arrow).
- Panels/cards: dark glass (backdrop-blur, hairline border, ~14px radius, warm-tinted soft shadow on hover).
- Hero showpiece: a dark-glass COMMAND-PALETTE mockup (instead of a photo) listing the owner's case
  studies as commands, e.g. "open case-study konwerter-bom ⌘1", first row active with a warm tint,
  blinking warm caret, footer strip of mono hints ("↑↓ nawigacja · enter otwórz · esc zamknij").

## Motion
- Aurora drift/breathe loops; cards lift 2px with warm-tinted shadow on hover (200ms ease-out);
  caret blink in palette. Respect prefers-reduced-motion: freeze aurora at full-bloom frame.

## Requirements
- Responsive: desktop 1440, mobile 375 (pill nav → compact bar; keycap buttons stack full width).
- WCAG AA contrast — aurora stays behind and desaturated where text sits; visible focus rings.
- No stock photos, no emoji, inline SVG icons only.
