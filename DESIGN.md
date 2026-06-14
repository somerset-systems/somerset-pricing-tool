---
name: Somerset Systems Pricing Tool
description: Pre-call pricing and ROI calculator for Somerset Systems salespeople
colors:
  brand-green: "#2D5E3A"
  brand-green-light: "#3D7A4E"
  bg-page: "#EDEADE"
  bg-card: "#FFFFFF"
  text-heading: "#1C1C1C"
  text-body: "#3D3D3D"
  text-secondary: "#5A5A5A"
  text-muted: "#888888"
  border: "#D8D4C8"
  error: "#C0392B"
typography:
  display:
    fontFamily: "DM Serif Display, Georgia, serif"
    fontSize: "20px–24px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "DM Serif Display, Georgia, serif"
    fontSize: "18px–20px"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  small:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "11px–12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "5px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand-green}"
    textColor: "{colors.bg-card}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.brand-green-light}"
    textColor: "{colors.bg-card}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  button-secondary:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  section-card:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.lg}"
  input-field:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
---

# Design System: Somerset Systems Pricing Tool

## 1. Overview

**Creative North Star: "The Prepared Consultant"**

This is a tool built for a specific moment: a salesperson, a prospect, a Zoom call. The interface should feel like a senior advisor walked in with a well-organized brief — everything in its place, nothing gratuitous. Precision is the aesthetic. The design earns authority through structure and restraint, not through decoration or visual complexity.

The warm off-white page background (#EDEADE) provides a document-like canvas that reads as prepared and considered, not like a web app. White cards sit on this surface with a subtle tonal distinction — lifted without drama. Somerset's forest green (#2D5E3A) is used economically, appearing only where it signals importance: active states, section accents, primary actions. Its rarity is what gives it weight.

Typography anchors the system. DM Serif Display carries headlines with quiet authority — not the crisp geometry of a SaaS tool, but the gravitas of a printed report. DM Sans handles all UI and body copy: readable, neutral, professional. The pairing communicates that this was designed, not assembled.

This system explicitly rejects the look of generic Excel/PDF outputs: unstyled tables, no visual hierarchy, no brand coherence. Every screen should be unmistakably Somerset's work, not a commodity export.

**Key Characteristics:**
- Warm, document-like background with white card surfaces
- Forest green used sparingly as the single authority signal
- Serif display font paired with a neutral sans for UI and body
- Nearly flat elevation: surfaces distinguished by tonal layering and borders, not shadows
- Restraint is the design voice: controls acknowledge interaction without performing it

## 2. Colors: The Consultant's Palette

A single-accent system built around one saturated brand color and a warm neutral ramp. The green earns meaning through scarcity.

### Primary
- **Canopy Green** (#2D5E3A): The Somerset brand anchor. Used for primary buttons, active/selected states, section card top-border accents in the output panel, impact badges (High), step indicator active dots, checkbox fill, and the persistent header. Never used as a background on large surfaces.
- **Canopy Green Light** (#3D7A4E): Hover state for the primary button only. Not used independently.

### Neutral
- **Document White** (#FFFFFF): Card surfaces, input backgrounds. Sits on the warm page background to create tonal separation without shadows.
- **Warm Parchment** (#EDEADE): Page background. Reads as a document canvas, not a screen background.
- **Near Black** (#1C1C1C): Headings, completed step indicators, Medium impact badges. The darkest ink, reserved for structural anchors.
- **Ink** (#3D3D3D): Body text. One step back from headings, still high-contrast.
- **Iron** (#5A5A5A): Secondary text, field labels, descriptions. Readable, supporting.
- **Ash** (#888888): Muted text, Low impact badges, placeholder text. The quietest readable value; never go lighter for text on white.
- **Warm Sand** (#D8D4C8): Borders, dividers, inactive controls. Has warmth to it — not a neutral gray, but not decorative either.
- **Error Red** (#C0392B): Inline field validation errors only. Never decorative.

### Named Rules
**The One Accent Rule.** Canopy Green (#2D5E3A) is the only saturated color in the system. When it appears, it means something is active, selected, primary, or authoritative. Never use it for background fills on large surfaces or decorative accents. Its scarcity is what makes it legible as a signal.

**The Rarity Rule.** No other accent colors. No purple, no blue, no orange. The warm neutral ramp — parchment, sand, ash — is the supporting cast. Green is the lead.

## 3. Typography

**Display Font:** DM Serif Display (Georgia, serif as fallback) — weight 400 only
**Body / UI Font:** DM Sans (system-ui, sans-serif) — weights 400 and 500

**Character:** DM Serif Display brings quiet authority to headings without ornamentation — it reads as considered, not decorative. DM Sans handles everything operational: inputs, labels, body copy, badges. The contrast between a classical serif and a clean humanist sans communicates that the tool was designed with intention.

### Hierarchy
- **Display** (weight 400, 20–24px, line-height 1.2): Section headings in the output panel, page-level question headings. DM Serif Display only. Used for the moments where the client needs to orient.
- **Headline** (weight 400, 18–20px, line-height 1.3): Card headings, step-level headings. DM Serif Display. Subsection anchors.
- **Body** (weight 400, 15px, line-height 1.6): Primary readable content, task labels, field values. DM Sans. Max line length 65–75ch.
- **Label** (weight 500, 13px, line-height 1.4): Field labels, section subheads, control labels. DM Sans medium. Uses Canopy Green (#2D5E3A) when labeling an active input.
- **Small** (weight 400, 11–12px, line-height 1.5): Badges, tooltips, metadata, trace sub-rows. DM Sans. Never goes below 11px.

### Named Rules
**The Two-Font Rule.** DM Serif Display for headings; DM Sans for everything else. No third typeface, no decorative scripts, no monospace unless explicitly rendering code. The pairing earns its distinction through the serif/sans contrast — don't dilute it.

**The Heading Weight Rule.** DM Serif Display is always weight 400. It has authority through its letterforms, not through boldness. Never bold a DM Serif Display heading.

## 4. Elevation

This system is tonal and nearly flat. Surfaces are distinguished primarily by background color and top-border accents, not by shadow depth. Shadows exist but are ambient and restrained — they describe presence, not hierarchy.

Cards use a green-tinted ambient shadow (`0 2px 16px rgba(45, 94, 58, 0.10)`) that ties shadow color to the brand. On the warm parchment background, this creates a gentle lift without drama. Input/field containers on the Step 1 and Step 2 pages use a minimal ambient shadow (`0 1px 4px rgba(0,0,0,0.06)`) — barely visible, just enough to separate white from parchment.

The primary tonal device in the output panel is the green top border (3px) on section cards — a structural accent that organizes sections without adding z-axis complexity, and without the side-stripe pattern the system bans.

### Shadow Vocabulary
- **Card shadow** (`0 2px 16px rgba(45, 94, 58, 0.10)`): Output panel section cards and step cards. Green-tinted ambient lift.
- **Container shadow** (`0 1px 4px rgba(0,0,0,0.06)`): Wizard step wrappers (NicheSelector, CompanyProfile). Minimal separation from page background.
- **Focus ring** (`0 0 0 3px rgba(45, 94, 58, 0.12)`): Keyboard/click focus on inputs. Brand green at low opacity. Non-intrusive.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows appear only to distinguish card surfaces from the parchment background. Never add shadows to indicate hover or selection states — use color changes (border, background tint) instead.

## 5. Components

### Buttons
Buttons are confident and restrained. Hover states are controlled — a background shift, no movement or transform.

- **Shape:** Gently squared edges (5px radius, `{rounded.md}`)
- **Primary:** Canopy Green fill (#2D5E3A), white text, DM Sans 500 15px, 12px/28px padding. No border.
- **Primary Hover:** Background shifts to #3D7A4E. Transition: `background 0.12s`. No movement.
- **Primary Disabled:** Gray fill (#D1D5DB), white text, cursor not-allowed. Never uses green when inactive.
- **Secondary / Back:** White background, border 1.5px Warm Sand. Hover shifts background to #F0F4F1 (light green tint). Text: Near Black.
- **Never use `border-radius: 9999px` (pill shape) on buttons.** Rounded-md only.

### Cards / Containers

**Wizard step cards** (NicheSelector, CompanyProfile, TaskAudit): White background, 8px radius, 1px Warm Sand border, minimal ambient shadow. Padding 32px. These are the working surface — quiet, document-like.

**Output section cards** (OutputPanel SectionCard): White background, 8px radius, 1px Warm Sand border with a green top border (3px solid #2D5E3A), green-tinted ambient shadow. The top border is the primary organizational device in the output view — a structural accent, never a side stripe.

**Selection cards** (NicheSelector options): White at rest, 1.5px Warm Sand border, 5px radius. Selected state: light green background (#F0F4F1) with a full 1.5px Canopy Green border (#2D5E3A). Never a left stripe; never nested inside another card.

### Inputs / Fields
Restrained and functional. Focus is acknowledged quietly.

- **Style:** White background, 1.5px Warm Sand border (#D8D4C8), 5px radius, 10px/14px padding, 15px DM Sans
- **Focus:** Border shifts to Canopy Green (#2D5E3A), green focus ring appears (`0 0 0 3px rgba(45,94,58,0.12)`). No other change.
- **Labels:** DM Sans 500 13px in Canopy Green (#2D5E3A). Always visible above the field.
- **Error:** Red text (#C0392B) below the field, 12px DM Sans. Field border does not change on error in the current implementation.
- **Disabled / Read-only:** Not defined; not yet needed.

### Step Indicator
Linear, top-of-page progress tracker. Four steps.

- **Active:** Canopy Green filled circle, white step number, DM Sans 500
- **Completed:** Near Black filled circle, white checkmark (✓)
- **Inactive:** White circle with Warm Sand border, Ash text
- **Connector line:** Thin 2px line. Canopy Green when step is completed; Warm Sand otherwise.
- **Labels below circles:** Active = Canopy Green; Completed = Near Black; Inactive = Ash

### Impact Badges / Chips
Solid-fill pill-like chips used in the task list and output panel. Three severity levels.

- **High:** Canopy Green background (#2D5E3A), white text. Signals direct revenue impact.
- **Medium:** Near Black background (#1C1C1C), white text. Supporting signal.
- **Low:** Ash background (#888888), white text. Quiet, de-emphasized.
- **Style:** 3px/9px padding, 4px radius, 11px DM Sans 500, letter-spacing 0.03em. Dense by design.

### Frequency Selector Buttons
Three-button toggle used inline within task rows. Only one active at a time.

- **Active:** Canopy Green fill (#2D5E3A), white text, green border. Same active color as all primary actions in the system.
- **Inactive:** White background, secondary text (#5A5A5A), Warm Sand border. Hover: border and text shift to Canopy Green.
- **Style:** 4px/9px padding, 5px radius, 12px DM Sans 500

### Tooltips
Dark-on-dark, anchored above the triggering element. CSS-only (no JS positioning).

- **Background:** Near Black (#1C1C1C), white text, 4px radius
- **Size:** 11px DM Sans 400, 5px above trigger element
- **Width:** Fixed 230px for impact badges; `white-space: nowrap` for frequency tooltips

## 6. Do's and Don'ts

### Do:
- **Do** use Canopy Green (#2D5E3A) exclusively to signal active, selected, or primary action states. Its scarcity makes it meaningful.
- **Do** use DM Serif Display for all headings and section anchors, always at weight 400. Let the letterforms carry the authority.
- **Do** show formulas and calculation traces for every number on the output panel. Transparency is the product.
- **Do** use the warm parchment background (#EDEADE) as the page canvas and white (#FFFFFF) only for card/input surfaces. The contrast is subtle and intentional.
- **Do** keep hover and focus states controlled: background color shifts only. No movement, no scale, no transform on buttons.
- **Do** use a 3px green top-border accent as the primary organizational device on output cards. It organizes without adding elevation and without a side stripe.
- **Do** size text for screenshare legibility in the output panel. Client-facing narrative copy holds a 13px floor; 11–12px is reserved for opt-in calculation traces inside an opened disclosure, where the prospect chose to see the math. Output headings should read clearly at 13–15" screen, viewed by two people.
- **Do** keep borders at 1px or 1.5px for structural lines and Warm Sand borders. The 3px green top-border accent is the only thick border allowed.

### Don't:
- **Don't** produce outputs that look like plain Excel/PDF exports: unstyled tables, no hierarchy, no brand markers. This is the named anti-reference. Every output screen must be unmistakably Somerset's work.
- **Don't** introduce purple, blue, orange, or any additional accent color. The one-accent system is load-bearing — any addition dilutes the green's authority signal.
- **Don't** use gradient text (`background-clip: text`). Single solid color only.
- **Don't** use a colored `border-left`/`border-right` greater than 1px as an accent stripe on cards, rows, or callouts. The structural accent is a 3px green *top* border; side stripes are banned. Selection states use a full border plus a background tint, never a stripe.
- **Don't** bold DM Serif Display headings. It has authority without weight; bolding breaks the letterform design.
- **Don't** use glassmorphism, frosted cards, or backdrop-filter effects. They are decorative and at odds with the document-like canvas.
- **Don't** use small-caps eyebrow labels on every section (the `ABOUT / PROCESS / PRICING` pattern). This is the AI scaffold reflex. Use DM Serif Display hierarchy instead.
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding. Numbers are only appropriate in genuinely sequential flows.
- **Don't** use `border-radius: 9999px` on buttons. Rounded-md (5px) only.
- **Don't** add any math to component files. All calculations belong in `calculations.js`.
