# DESIGN.md — Visual Design Specification

Reference this before writing any CSS or component markup.

---

## Aesthetic Direction

**Tone:** Established firm. Refined utility. Not a startup, not a SaaS product.
Think: a well-made leather-bound notebook, a good law firm's letterhead.
The tool should feel like something a serious company built — not an AI demo.

**Palette:**
```css
:root {
  --brand-green:      #2D5E3A;
  --brand-green-lt:   #3D7A4E;
  --bg-page:          #EDEADE;
  --bg-card:          #FFFFFF;
  --text-heading:     #1C1C1C;
  --text-body:        #3D3D3D;
  --text-secondary:   #5A5A5A;
  --text-muted:       #666666;
  --border:           #D8D4C8;
  --error:            #C0392B;
  --success:          #2D5E3A;
}
```

**Color substitution reference (old → new):**
- `#6B3F1F` (brand brown) → `#2D5E3A`
- `#D4691E` (brand orange) → `#2D5E3A`
- `#F0934A` (light orange) → `#3D7A4E`
- `#FAF7F4` (warm off-white) → `#EDEADE`
- `#1C0F00` (dark brown heading) → `#1C1C1C`
- `#3D2010` (brown body) → `#3D3D3D`
- `#7A5C45` (secondary brown) → `#5A5A5A`
- `#A8907C` (muted brown) → `#666666`
- `#E8DDD5` (border) → `#D8D4C8`
- `#FFF7F2` (light orange tint) → `#F0F4F1`

**Impact badge colors:**
- High: background `#2D5E3A`, white text
- Medium: background `#1C1C1C`, white text
- Low: background `#666666`, white text

**Fonts (Google Fonts — load via @import in index.css):**
- Headings: `DM Serif Display` (weight 400) — authoritative, editorial
- Body / UI: `DM Sans` (weight 400, 500) — clean, legible, not generic

---

## Layout

- Max content width: 720px, centered
- Page padding: 24px horizontal on mobile, 48px on desktop
- Card padding: 32px
- Step gap: 48px vertical between sections
- All cards: white background, `box-shadow: 0 2px 12px rgba(45, 94, 58, 0.08)`
- Card border-radius: 8px (rounded-lg in Tailwind)

---

## Step Indicator

- 4 circles connected by a horizontal line
- Completed step: filled dark circle (`#1C1C1C`) with white checkmark
- Active step: filled green circle (`#2D5E3A`) with white step number
- Upcoming step: white circle with green border (`#2D5E3A`), gray step number
- Step labels below each circle (short: "Niche", "Company", "Friction", "Assessment")
- Line between circles: dark (`#1C1C1C`) when passed, gray when upcoming

---

## Buttons

Primary (Continue, Generate Output):
```css
background: #2D5E3A;
color: white;
padding: 12px 28px;
border-radius: 6px;
font: 500 15px 'DM Sans';
border: none;
```
Hover: background `#1C3D28`

Secondary (Back):
```css
background: transparent;
color: #2D5E3A;
border: 1.5px solid #2D5E3A;
padding: 12px 28px;
border-radius: 6px;
```
Hover: background `#F0F4F1`

Never use rounded-full. Never use blue or purple. Never use drop shadows on buttons.

---

## Inputs

```css
border: 1.5px solid #D8D4C8;
border-radius: 6px;
padding: 10px 14px;
font: 400 15px 'DM Sans';
color: #1C1C1C;
background: #FFFFFF;
```
Focus: border-color `#2D5E3A`, box-shadow: `0 0 0 3px rgba(45, 94, 58, 0.15)`

Label above every input:
```css
font: 500 13px 'DM Sans';
color: #2D5E3A;
margin-bottom: 6px;
display: block;
```

Error state: border-color `#C0392B`, error message below in `#C0392B`, 12px

---

## Niche Selector Cards (Step 1)

Large clickable cards, 2-column grid on desktop, 1-column on mobile.
Each card:
- White background, border 1.5px solid `#D8D4C8`
- Icon (simple SVG or emoji) + niche name in DM Serif Display
- Short descriptor in DM Sans below
- Selected state: border-color `#2D5E3A`, background `#F0F4F1`, left border 4px solid `#2D5E3A`

---

## Task Audit (Step 3)

Each task is a row:
- Checkbox on left (custom styled — green when checked, `#2D5E3A`)
- Task label in DM Sans
- Hours input (small, inline) that appears only when checked
- Default value pre-filled in the hours input
- Rows have a subtle bottom border to separate them
- Checked rows have a very light green tint (`#F0F4F1`) background
- Frequency buttons: active state is green (`#2D5E3A`), inactive outline is green

---

## Output Panel (Step 4)

Three distinct sections, each in its own card with green left border (`#2D5E3A`).

**Capabilities (Section D.5):**
- Non-highlighted capability cards: `#FAFAFA` background, `1px solid var(--border)` all sides
- Highlighted cards (task marked Constantly maps to this capability):
  - Background: `#F0F4F1`
  - Left border: `3px solid #2D5E3A`
  - "Recommended" label in top-right: `10px DM Sans 500 #2D5E3A`
- No cards are highlighted by default — only when matching tasks are set to Constantly

**Print/Share button** at bottom right, green (`#2D5E3A`), prominent.

---

## Dynamic Capability Highlighting

When a task is set to "Constantly" in Step 3, the following capability cards are highlighted in the output:

| Task ID       | Highlighted Capability Title(s)                              |
|---------------|--------------------------------------------------------------|
| scheduling    | Scheduling and Dispatch Optimization                         |
| followup      | Automated Follow-Up Workflows, Maintenance Renewal Tracker   |
| proposals     | Proposal and Work Order Automation                           |
| invoices      | Automated Invoicing                                          |
| jobstatus     | Job Status Tracker                                           |
| reports       | Weekly Report Automation, AI Owner Briefings                 |
| custom-*      | AI Operations Assistant                                      |

---

## Print Styles

```css
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  body { background: white; font-size: 12px; orphans: 3; widows: 3; }
  h1, h2, h3 { font-family: 'DM Serif Display', serif; page-break-after: auto; }
  .card, [class*="card"] { box-shadow: none; border: 1px solid #ccc; page-break-inside: avoid; break-inside: avoid; }
  tr { page-break-inside: avoid; break-inside: avoid; }
}
```

PrintSummary.jsx layout (hidden on screen, shown only on print):
- Somerset Systems header with logo placeholder
- Client company name + date
- Company Snapshot card
- Friction Areas card
- ROI / Opportunity card
- Implementation Phases card
- Capabilities card
- Why This Fits card
- Footer: "Prepared by Somerset Systems | somersetsystems.co"

---

## Responsive

- Mobile-first. All steps work on a phone screen (min 375px).
- Niche cards: 2-col grid → 1-col below 600px
- Output cards: full width, stack vertically
- Step indicator: shrink labels to icons-only below 480px
- Font sizes: reduce heading by ~2px on mobile
