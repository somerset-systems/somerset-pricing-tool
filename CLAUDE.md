# CLAUDE.md — Somerset Systems Pricing Tool

Read this entire file before writing a single line of code.
This is the full design specification, logic contract, and development rulebook for this project.
Every decision you make should be traceable back to something written here.

---

## What This Tool Is

An interactive pricing and ROI calculator **designed as a pre-call presentation tool**. The salesperson fills it out before the call, then screenshares the output to the prospect during the Zoom. The tool asks structured questions, then outputs a recommended price range, an ROI estimate, and a printable/shareable summary the client can take away.

This is NOT a black box. Every number the tool produces must be explained inline — the client should be able to see exactly how Somerset arrived at the price and what the ROI calculation is based on. Trust is the core design constraint.

The output page (Step 4) is designed for screenshare legibility: larger headings, visible shadows, a prominent Phase 1 card, and a presentation banner that frames it as a document rather than a calculator result.

---

## Tech Stack

- React (Vite)
- Tailwind CSS (utility-first, configured via tailwind.config.js)
- No component libraries — build everything from scratch
- No backend, no API calls, no authentication
- All state lives in React (useState / useReducer). The in-progress session is mirrored to `localStorage` (key `somerset-pricing-tool-v1`) so an accidental refresh or tab switch mid-call doesn't wipe the salesperson's prep. This is client-side only — no server, no external state. A "Start over" control clears it.
- Print/share via window.print() with a dedicated print stylesheet

---

## File Structure

```
somerset-pricing-tool/
├── CLAUDE.md                  ← this file
├── docs/
│   ├── DESIGN.md              ← visual design spec
│   └── LOGIC.md               ← pricing and ROI calculation spec
├── public/
│   └── somerset-logo.png      ← placeholder, drop in real logo later
├── src/
│   ├── main.jsx               ← Vite entry point
│   ├── App.jsx                ← root component, holds all state
│   ├── index.css              ← global styles, Tailwind directives, print styles
│   ├── data/
│   │   └── niches.js          ← niche definitions, task categories, CAPABILITIES data
│   ├── components/
│   │   ├── StepIndicator.jsx  ← progress bar across top (4 steps)
│   │   ├── NicheSelector.jsx  ← Step 1: pick niche
│   │   ├── CompanyProfile.jsx ← Step 2: company size, revenue, employee count
│   │   ├── TaskAudit.jsx      ← Step 3: staff count + frequency per task, custom task entry
│   │   ├── OutputPanel.jsx    ← Step 4: three-bucket ROI + capabilities + full breakdown
│   │   └── PrintSummary.jsx   ← print-only layout, hidden on screen
│   └── utils/
│       └── calculations.js    ← all pricing and ROI math, pure functions, no side effects
```

---

## Application Flow

The tool is a **4-step wizard**. Each step is a separate view. Navigation: Back / Continue buttons.
The user cannot skip steps. All steps are in a single-page layout — no routing needed.

### Step 1 — Niche Selection
A large-button selector. Options:
- HVAC Contractor
- Commercial Electrical Contractor
- Legal Firm
- Other (opens a free-text field for niche name, then uses generic task list)

### Step 2 — Company Profile
Fields (all required before Continue):
- Annual revenue (range selector: <$2M / $2–5M / $5–10M / $10M+)
- Number of employees (numeric input)
- Number of field staff or billable staff (numeric input, label changes by niche)
- Owner-operated? (yes/no toggle)

### Step 3 — Operational Friction Assessment (step label: "Friction")
Header: "Where Is Your Team Losing Time?"

Each task has:
- Checkbox to include/exclude
- Impact badge (High / Medium / Low) with hover tooltip — badges appear above on hover
- When checked: two inline controls appear below the label row:
  - **Staff affected** — numeric text input, min 1, default 2
  - **Frequency** — buttons: Occasionally / Regularly / Constantly. Default: Regularly.
  - Selected frequency button: orange background + white text. Unselected: brown outline.
- Hours are derived from staff × frequency (hidden from UI — math lives in calculations.js)

Impact badge tooltips (appear above the badge on hover):
- High: "High revenue impact — automating this directly affects what you close or retain"
- Medium: "Medium impact — meaningful time savings, lower direct revenue risk"
- Low: "Lower impact — useful to automate but limited effect on top-line results"

Tasks sorted: High impact first, Medium second, Low third. Within each group, sorted by derived hours descending (reactive — re-sorts as user changes staff/frequency).

Below the built-in task list, an **"+ Add your own"** button (brown outline) appends a custom task row. Each custom task has: a text input for the name, the same staff + frequency controls, a × remove button, and a Medium impact badge. Custom tasks are always included (no checkbox). They feed into all calculations and appear in Section B output exactly like built-in tasks. Custom task defaults: `laborCategory: 'operations', valueBucket: 'operational'`.

### Step 4 — Output Panel (Operational Opportunity Assessment)
Six sections in order, each as its own card with brown left border:

**Section A — Company Snapshot**: industry, revenue range, team size, framing statement.

**Section B — Operational Friction Areas**: All included/custom tasks grouped High → Medium → Low. Shows `deriveTaskHours(task)` hrs/wk per row.

**Section C — Where We See Opportunity**: Three subsections with chevron dropdowns (closed by default):
1. Operational Capacity Unlocked — headline with floor/ceiling range, dropdown shows per-task trace table
2. Revenue Recovery Opportunity — conditional on checked revenue_recovery tasks, signal badge (Low/Medium/High), dropdown shows signal logic and note
3. Strategic Visibility Benefits — conditional on ≥2 operational tasks, bullet list (no dropdown)
Below the subsections: Payback, Year 1, Year 2 rows (each with dropdown trace). Then assumptions paragraph.

**Section D — Recommended Implementation Phases**: Three phase cards.
Phase 1 (Pilot & Proof) — orange highlight, investment = calculated Phase 1 range.
Phase 2 (Intelligence Layer). Phase 3 (Ongoing Optimization).
30-day performance guarantee copy below.

**Section D.5 — What We Can Build For You** (between D and E): Niche-filtered capability cards. Each card has title, one-sentence description, and a tag (Operational Efficiency / Revenue Intelligence / Financial Clarity). No interactivity. Note at bottom: "We build on top of your existing software. All capabilities connect directly to the tools you already use. Your Phase 1 pilot addresses one or two of these. A full engagement can include any combination."

**Dynamic capability highlighting:** Cards that directly address a task the user marked as "Constantly" receive a "Recommended" label, green left border, and green-tinted background. Mapping (task ID → capability titles):
- `scheduling` → Scheduling and Dispatch Optimization
- `followup` → Automated Follow-Up Workflows, Maintenance Renewal Tracker
- `proposals` → Proposal and Work Order Automation
- `invoices` → Automated Invoicing
- `jobstatus` → Job Status Tracker
- `reports` → Weekly Report Automation, AI Owner Briefings
- Any custom task (id starts with `custom-`) → AI Operations Assistant
If no tasks are marked Constantly, no cards are highlighted.

HVAC/Electrical capabilities (17 cards, in order):
1. Proposal and Work Order Automation — Operational Efficiency
2. Scheduling and Dispatch Optimization — Operational Efficiency
3. Automated Invoicing — Operational Efficiency
4. Job Status Tracker — Operational Efficiency
5. AI Owner Briefings — Operational Efficiency
6. Technician Profitability Dashboard — Revenue Intelligence
7. Job Type Margin Analysis — Revenue Intelligence
8. Estimate Conversion Tracking — Revenue Intelligence
9. Maintenance Renewal Tracker — Revenue Intelligence
10. Automated Follow-Up Workflows — Revenue Intelligence
11. Missed Call Recovery — Revenue Intelligence
12. Callback and Warranty Tracking — Revenue Intelligence
13. 30/60/90 Capacity Forecast — Operational Efficiency
14. Cross-System Reporting — Financial Clarity
15. Lead Source Attribution — Financial Clarity
16. AI Operations Assistant — Operational Efficiency
17. Weekly Report Automation — Operational Efficiency

Legal capabilities (10 cards, in order):
1. Client Intake Automation — Operational Efficiency
2. Caseload Intelligence Dashboard — Operational Efficiency
3. Deadline and Compliance Tracker — Operational Efficiency
4. AI Owner Briefings — Operational Efficiency
5. Automated Invoicing and Billing — Operational Efficiency
6. Weekly Report Automation — Operational Efficiency
7. Billing Realization Tracker — Financial Clarity
8. Client Follow-Up Automation — Revenue Intelligence
9. Cross-System Reporting — Financial Clarity
10. AI Operations Assistant — Operational Efficiency

**Section E — Why This Fits Your Business**: Four bullet points + "Where This Can Go" subsection.

**Print/Share button** triggers window.print() → shows PrintSummary.jsx.

---

## State Architecture

All state lives in App.jsx. Pass down via props. No Context API.

```js
// App.jsx state shape
{
  currentStep: 1,           // 1–4
  niche: null,              // 'hvac' | 'electrical' | 'legal' | 'other'
  nicheLabel: '',
  company: {
    revenueRange: '',       // '<2m' | '2-5m' | '5-10m' | '10m+'
    employees: '',
    billableStaff: '',
    ownerOperated: null,
    yearsInBusiness: '',    // 'under5' | '5-15' | '16-30' | '30+' | '' (optional)
  },
  tasks: [],                // [{ id, label, impact, laborCategory, valueBucket, efficiencyFactor, included, people, frequency }]
  customTasks: [],          // [{ id, label, impact:'Medium', laborCategory:'admin'|'operations'|'owner', valueBucket:'operational', efficiencyFactor:0.65, included:true, people, frequency }]
  // laborCategory on customTasks is mutable via inline select (Admin/Operations/Owner). Default: 'operations'.
  // efficiencyFactor: fraction of task time that automation can realistically capture (0–1). Comes from niches.js for built-in tasks; custom tasks default to 0.65.
  output: null,             // { pricing, roi, phase1 }
}
// people: integer (default 2, minimum 1)
// frequency: 'Occasionally'|'Regularly'|'Constantly'
// output.roi contains cappedAt25, cappingNote, operationalFloor/Ceiling, revenueRecoverySignal, calculationTrace, etc.
```

---

## Calculation Rules (see also docs/LOGIC.md)

All math lives in `src/utils/calculations.js`. Pure functions only.

### Task Fields
Each task has `laborCategory` ('admin'|'operations'|'owner'), `valueBucket` ('operational'|'revenue_recovery'), and `efficiencyFactor` (number 0–1).
These come from niches.js for built-in tasks and default to `operations`/`operational`/`0.65` for custom tasks.

**efficiencyFactor** represents what fraction of the time spent on this task automation realistically captures.

HVAC/Electrical efficiency factors:
- Writing proposals and work orders by hand → 0.65
- Scheduling and dispatching technicians → 0.55
- Generating invoices after job completion → 0.80
- Following up with past clients for maintenance → 0.70
- Tracking job status across multiple crews → 0.60
- Compiling weekly/monthly reports for the owner → 0.75

Legal efficiency factors:
- Drafting client intake documents → 0.65
- Writing case status summaries → 0.70
- Tracking court filing deadlines → 0.75
- Generating billing summaries and invoices → 0.80
- Following up with clients on document requests → 0.70
- Compiling weekly caseload reports → 0.75

Generic efficiency factors:
- Writing and sending proposals → 0.65
- Generating invoices → 0.80
- Scheduling and coordination → 0.55
- Client follow-up and outreach → 0.70
- Internal reporting → 0.75
- Document filing and tracking → 0.70

Efficiency factor plain-English labels (shown in OutputPanel nested dropdown and PrintSummary):
- 0.80: "80% automatable — minimal human judgment required"
- 0.75: "75% automatable — light review still needed"
- 0.70: "70% automatable — some coordination remains manual"
- 0.65: "65% automatable — human oversight is part of the workflow"
- 0.55: "55% automatable — significant judgment calls remain"

### People × Frequency → Derived Hours → Effective Hours
```
Occasionally = 1 hr/week per person
Regularly    = 3 hrs/week per person
Constantly   = 6 hrs/week per person
people is a plain integer (min 1)

deriveTaskHours(task) = parseInt(task.people) × FREQUENCY_HOURS[task.frequency]   // raw hours
effectiveHours(task)  = deriveTaskHours(task) × task.efficiencyFactor              // hours automation can capture
```

The cap check, annual floor/ceiling, payback, Year 1, and Year 2 all use effectiveHours (not raw hours).
Section B (Where Your Team Is Losing Time) shows raw derived hours — the actual time spent, regardless of automatability.

### Labor Rate Ranges
```
admin:      $25–$35/hr
operations: $35–$60/hr
owner:      $75–$150/hr (reserved for future use)
```

### Base Price from Revenue Range
| Revenue Range | Base Price Floor | Base Price Ceiling |
|---------------|-----------------|-------------------|
| < $2M         | $8,000          | $12,000           |
| $2–5M         | $10,000         | $15,000           |
| $5–10M        | $15,000         | $22,000           |
| $10M+         | $22,000         | $35,000           |

No circumstance modifiers. Full-engagement maintenance fee = round(midpoint × 0.10, nearest $500) — used internally. Phase 3 card displays Phase 1-based maintenance (see Phase 1 Pricing below).

### Phase 1 Pricing
Fixed tier table — not percentage-based. Minimum spread of $1,500 enforced (already satisfied by these values, but the guard remains in code).

| Revenue Range | Phase 1 Floor | Phase 1 Ceiling |
|---------------|---------------|-----------------|
| < $2M         | $2,500        | $4,000          |
| $2–5M         | $3,500        | $6,000          |
| $5–10M        | $5,000        | $8,500          |
| $10M+         | $7,500        | $12,000         |

`calculatePhase1Range` returns `{ floor, ceiling, tierKey }` where `tierKey` is the revenueRange key. The `tierKey` and tier source ("Fixed tier table") are stored in `calculationTrace`.

### Phase 1 Maintenance Fee (calculatePhase1Maintenance)
Displayed in Phase 3 card. Derived from Phase 1 midpoint — NOT the full engagement midpoint.
- phase1Midpoint = (phase1.floor + phase1.ceiling) / 2
- phase1Maintenance = round(phase1Midpoint × 0.10, nearest $50)
- Trace stored: "Phase 1 midpoint ($X) × 10% = $Y/month"
- All downstream calculations (Year 1, Year 2) use this value for monthlyMaintenance.

### Three-Bucket ROI (calculateROI)

Function signature: `calculateROI({ tasks, monthlyMaintenance, phase1, employees, yearsInBusiness })`
`employees` comes from `company.employees` in App.jsx state. `yearsInBusiness` comes from `company.yearsInBusiness`.

**Dynamic cap (calculateHrCap):**
- `employees <= 10` → cap = 25 hrs/week
- `employees > 10` → cap = 25 + ((employees - 10) × 2) hrs/week
- Examples: 10 → 25, 20 → 45, 50 → 105, 100 → 205

**Bucket 1 — Operational Capacity Unlocked:**
- Filter tasks: `included && valueBucket === 'operational'`
- Per task: rawHours = people × freqHours; effectiveHours = rawHours × efficiencyFactor
- Sum effectiveHours across operational tasks; if total exceeds dynamic cap, scale all proportionally
- Per task: annualFloor = scaledHours × 52 × laborCategory.floor
- Per task: annualCeiling = scaledHours × 52 × laborCategory.ceiling
- Total operationalFloor and operationalCeiling rounded to nearest $1,000
- Full chain stored in calculationTrace per task: rawHours → efficiencyFactor → effectiveHours → scaledHours → annualFloor/Ceiling

**Bucket 2 — Revenue Recovery Opportunity:**
- Filter tasks: `included && valueBucket === 'revenue_recovery'`
- Signal thresholds: 0 tasks → null; ≥2 tasks OR >8 hrs → 'high'; ≥3 hrs → 'medium'; otherwise → 'low'
- **yearsInBusiness upgrade rules** (applied after base signal is computed):
  - `yearsInBusiness === '30+' && signal === null` → upgrade to 'low' + add tenure note
  - `yearsInBusiness === '30+' && signal === 'low'` → upgrade to 'medium' + append tenure note
  - `yearsInBusiness === '16-30' && signal === 'low'` → upgrade to 'medium' + append tenure note
  - All other combinations unchanged
- Tenure note text: "Adjusted for company tenure — established businesses typically carry a large base of lapsed maintenance clients representing meaningful re-engagement opportunity."

**Bucket 3 — Decision Quality:**
- Shows fixed list of 4 strategic benefits when ≥2 operational tasks checked

**Payback and Year 1/2:**
- phase1Midpoint = (phase1.floor + phase1.ceiling) / 2
- weeklyOperationalValue = operationalMidpoint / 52
- paybackFloorWeeks = phase1.floor / weeklyOperationalValue
- paybackCeilingWeeks = phase1.ceiling / weeklyOperationalValue
- year1NetFloor = operationalFloor − phase1Midpoint − (maintenance × 12)
- year1NetCeiling = operationalCeiling − phase1Midpoint − (maintenance × 12)
- year2NetFloor = operationalFloor − (maintenance × 12)
- year2NetCeiling = operationalCeiling − (maintenance × 12)

All inputs/rates/derived values stored in `roi.calculationTrace` for dropdown display, including `phase1MaintenanceTrace` (human-readable derivation string).

**Operational capacity table nested dropdowns:** Each task row in the Operational Capacity dropdown table has a ▼/▲ toggle that expands an inline calculation row showing: raw hours formula, cap scaling (if applied — uses dynamic `hrCap` and `numEmployees` from trace), annual floor formula, annual ceiling formula. Only one task's nested breakdown is open at a time (tracked via `openTaskCalc` state in OutputPanel).

**Cap note:** When cap is applied, a highlighted note appears below the table in OutputPanel showing the formula and plain-English explanation. `calculationTrace` includes: `isCapped`, `hrCap`, `numEmployees`, `capFormula`.

**Weekly operational value transparency:** An always-visible muted line appears below the payback TraceRow: "Weekly operational value: Annual operational midpoint ($X) ÷ 52 weeks = $Y/week."

---

## Styling Rules

- Colors: Green (#2D5E3A) — Somerset brand. Never purple. Never blue. Never brown or orange.
- Background: Warm off-white (#EDEADE)
- Text: #1C1C1C headings, #3D3D3D body
- Font: "DM Serif Display" (headings, weight 400), "DM Sans" (body/UI, 400/500). Load via @import in index.css.
- All inputs have visible labels. Required field errors below field in red.
- Tailwind for layout. Inline styles for exact brand colors.
- Never use rounded-full on buttons — use rounded-md.
- Impact badge tooltip: absolutely positioned above badge (bottom: calc(100% + 5px)), dark bg, white text, appears on hover via CSS.

---

## Print Stylesheet

@media print in index.css:
- Hide everything except .print-only
- PrintSummary renders at full width, no shadows
- Font size 12px body, 18px headings
- Page break before ROI section if it overflows

---

## Hard Rules — Never Break These

1. **No black-box outputs.** Every number on the output screen must show its formula or trace.
2. **No AI calls.** Entirely deterministic. No fetch to any API.
3. **localStorage is session-mirror only.** The working session is persisted to `localStorage` so a refresh mid-call survives; it holds no secrets and is cleared by "Start over". Never use it for anything beyond restoring in-progress wizard state.
4. **All calculations in calculations.js only.** No math in components.
5. **All state mutations in App.jsx only.**
6. **Every input must have a label.**
7. **Step navigation is linear.** 4 steps total.
8. **Print view is a separate component.**
9. **Tailwind for layout. Brand colors via inline style or CSS variables.**
10. **Run `npm run build` after every file change.** Fix errors immediately.

---

## What Not To Do

- Do not add routing
- Do not add animations beyond simple fades
- Do not install new npm packages without flagging it
- Do not add a backend, API, or auth layer
- Do not use Context API
- Do not refactor a working component unless explicitly asked
- Do not put any math in a component file
- Do not add a circumstance/context step — it was removed intentionally
- Do not show pricing floor/ceiling or salesperson adjustment to the client

---

## Brand Assets

All Somerset Systems brand files live at `C:\Users\tommy\LogoFIles\`. Read the Brand Guidelines PDF before making any brand or design decisions — it is the authoritative source for logo usage rules, color values, typography, and spacing.

| Asset | Path |
|---|---|
| **Brand Guidelines PDF** | `C:\Users\tommy\LogoFIles\Brand Guidelines\Brand Guidelines.pdf` |
| Logo SVG (primary, use this in code) | `C:\Users\tommy\LogoFIles\Source & Vector File\Somerset Systems.svg` |
| All logo PNGs (14 variants) | `C:\Users\tommy\LogoFIles\PNG Files\` |
| Horizontal lockup PNG (nav/header) | `C:\Users\tommy\LogoFIles\PNG Files\Somerset-Systems-5.png` |
| Stacked lockup PNG (hero/cover) | `C:\Users\tommy\LogoFIles\PNG Files\Somerset-Systems-1.png` |
| White lockup PNG (dark backgrounds) | `C:\Users\tommy\LogoFIles\PNG Files\Somerset-Systems-14.png` |
| Icon only PNG (green, avatars/small UI) | `C:\Users\tommy\LogoFIles\PNG Files\Somerset-Systems-9.png` |
| Favicon folder (copy to `public/`) | `C:\Users\tommy\LogoFIles\Favicon\` |
| Social media kit | `C:\Users\tommy\LogoFIles\Social Media Kit\` |
| 3D renders (mockups, hero images) | `C:\Users\tommy\LogoFIles\3D Render\` |
| Adobe Illustrator source | `C:\Users\tommy\LogoFIles\Source & Vector File\Somerset Systems.ai` |

**Note:** `public/somerset-logo.png` is a placeholder. Replace it by copying `Somerset Systems.svg` into `public/` and updating any `<img src="/somerset-logo.png">` references to `<img src="/Somerset Systems.svg" alt="Somerset Systems" />`. Copy the entire `Favicon\` folder contents into `public/` for browser tab icons.

When making any brand, color, or typography decision, read the Brand Guidelines PDF first. It overrides any design assumptions.
