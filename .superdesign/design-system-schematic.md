# Design System — Direction A: "Schematic" (engineering / technical)

## Product context
Personal portfolio website of a software engineer who builds internal tools and automation for an
electronics manufacturing (EMS) company: web platforms, ERP (SAP Business One) integrations,
warehouse scanner apps, label printing, BOM processing. Static site (Astro, GitHub Pages).
Bilingual: Polish (default) and English — a PL/EN switch is always visible in the header.

Audience and jobs-to-be-done (equal priority):
- Recruiter / tech lead: "In 30 seconds, tell me who this is, what stack, what level — and let me download the CV."
- Business client (manufacturing company): "Show me this person solves problems like mine, with measurable results — and how to start working together."

Key pages: Home (one long page), Projects list, Case study detail (/projekty/[slug]), 404.
Home sections in order: Hero → Selected projects → Experience → Skills → Collaboration (services) → Contact.

Content rules:
- Company projects are ANONYMOUS case studies: no company names, no real screenshots. Visuals are
  diagrams, schematic illustrations or abstract UI mockups.
- Every project card shows ONE concrete result metric (e.g. "−70% czasu przygotowania BOM").
- Two primary CTAs everywhere it matters: "Pobierz CV" (recruiter) and "Porozmawiajmy o projekcie" (client).
- Owner name placeholder: "Imię Nazwisko".

## Visual style (library style: "ascii-hero" — Dark Tech, adapted with a PCB/schematic motif)
- Background: deep black #000000. Cards/surfaces: #0a0a0a with a 1px ring border rgba(255,255,255,0.145).
- Text: primary #ffffff / #ededed, secondary #e7e7e7, muted #999999.
- Accent blue #52a8ff for active states, links on hover, highlighted traces. Success green #62c073 for
  positive metrics. NO other brand colors.
- Typography: "Inter Display" (fallback Inter) for headlines, weight 500, tight tracking (-1px to -3.36px);
  headline-fluid 32–60px. "Geist Mono" for ALL data: metrics, years, tech tags, IDs, section indices
  (e.g. "01 / PROJEKTY"), units. Body Inter 16px, line-height 1.6.
- Shape language: primary buttons are SQUARE (0px radius) — white #ffffff fill, #121212 text, diagonal
  arrow icon. Secondary button: transparent with 1px ring border, square. Status/tech chips are PILLS
  (100px radius), #1f1f1f fill, Geist Mono 12px uppercase #999999, optional 6px status dot.
- Signature motif — PCB/schematic: a very subtle 24px grid of dots (rgba(255,255,255,0.06)) behind
  sections; thin 1px "copper traces" (rgba(255,255,255,0.12), right-angle routing with 45° chamfers)
  that connect section indices and cards, ending in small via circles; one trace highlighted in #52a8ff.
  Section labels styled like component designators ("U1 · O MNIE", "J2 · KONTAKT").
- Metrics grid: 4-column border-connected grid, big numbers in Geist 56px tracking -3.36px with mono unit.
- Subtle radial accent glow (#52a8ff at ~8% opacity) behind the hero only.

## Motion
- Calm and precise: 150–250ms ease-out on hover (border ring brightens to rgba(255,255,255,0.3),
  arrow shifts 2px). A "signal" pulse travels along the highlighted trace every ~6s.
- Respect prefers-reduced-motion: disable trace animation and glows.

## Requirements
- Responsive: desktop 1440, mobile 375 (nav collapses to full-screen menu; grids → 1 column).
- WCAG AA contrast on all text; visible focus rings (2px #52a8ff).
- No stock photos, no emoji, inline SVG icons only.
