---
name: fullstack-master-craft
description: Exhaustive Master Specification for World-Class Full-Stack Engineering, Apple/Emil Kowalski Design Engineering, Fluid Motion Physics, Interface Hardening, Multi-Cloud BYOS Storage (R2, S3, Supabase, B2, Wasabi), Cryptographic Security, and Production Release Discipline.
---

# Master Full-Stack Design & Architecture Standard

This skill is the synthesized master standard derived from 371 skill files across 58 engineering, design, testing, and cloud infrastructure domains. It serves as an uncompromising reference for building fast, resilient, accessible, and stunning software.

---

## 1. Core Philosophy: The Craft Sensibility

### Taste is Trained, Not Innate
Good taste is a trained instinct: the ability to recognize what elevates an experience beyond "good enough." Reverse engineer every interaction, inspect micro-animations, understand layout physics, and demand perfection in execution.

### Unseen Details Compound
Users rarely notice individual micro-interactions consciously. When a feature behaves exactly as expected, users proceed effortlessly. A thousand barely perceptible details sing in tune to create an interface people love without knowing why.

### Beauty is Leverage
In a saturated ecosystem, visual elegance, tactile responsiveness, and fluid motion are decisive competitive differentiators. Beauty is underutilized in software—use it as leverage.

---

## 2. Design Engineering & Motion Physics (Emil Kowalski & Apple WWDC)

### The Animation Decision Framework
Before writing any animation code, answer these questions in strict order:

1. **Should this animate at all?**
   - *100+ times/day (Keyboard shortcuts, search command palettes)*: **Zero animation. Ever.** (Immediate display).
   - *Tens of times/day (Dropdowns, list navigation)*: Drastically fast (< 150ms).
   - *Occasional (Modals, drawers, toasts)*: Snappy animation (150ms – 250ms).
   - *First-time / Milestones (Onboarding, celebrations)*: Expressive delight.

2. **What is the purpose?**
   - Spatial continuity (e.g. entering and exiting along identical axes).
   - State transition feedback (e.g. button morphing to spinner).
   - Preventing jarring layout shifts.
   - *If the only justification is "it looks cool" for a frequently visited surface, do not animate.*

3. **What easing curve to apply?**
   - **Never use `ease-in` on UI controls.** `ease-in` delays initial movement, making interfaces feel sluggish.
   - **Entering elements**: Strong `ease-out` (instant response).
   - **On-screen morphing**: Balanced `ease-in-out`.
   - **Hover / Color shifts**: Standard `ease`.
   - **Continuous linear motion**: `linear`.

```css
/* Custom High-Energy Easing Curves */
--ease-out-snappy: cubic-bezier(0.23, 1, 0.32, 1);
--ease-drawer-ios: cubic-bezier(0.32, 0.72, 0, 1);
--ease-in-out-smooth: cubic-bezier(0.77, 0, 0.175, 1);
```

### Tactile Micro-Interactions
- **Immediate Response on Pointer-Down**: Highlight and press elements on pointer down, never waiting for release/click.
- **Button Press Scale**: Apply subtle compression (`:active { transform: scale(0.97); }`) with a 140ms ease-out transition.
- **Never Animate from `scale(0)`**: Nothing in the physical world emerges from nothingness. Animate from `scale(0.95)` with `opacity: 0`.
- **Origin-Aware Popovers**: Popovers and dropdowns scale from their trigger's anchor point (`transform-origin: var(--transform-origin)`). Modals are exempt and scale from viewport center.
- **Subsequent Hover Delay Skipping**: Tooltips should delay before first open, but instantly display on adjacent hover targets without delay or animation.

### Physical Spring Dynamics & Interruptibility
- **Interruptibility is Paramount**: Every animation must be interruptible and redirectable mid-motion. Grabbing a moving sheet or pressing Escape on an expanding card must smoothly reverse from the current presentation value, carrying live velocity rather than snapping or restarting keyframes.
- **Spring Parameterization**:
  - *Critically Damped (No Overshoot / General UI)*: Damping `1.0`, Response `0.3 – 0.4s`.
  - *Momentum / Gesture Flick (Subtle Bounce)*: Damping `0.8`, Response `0.3 – 0.4s` (reserve bounce strictly for momentum releases).
- **Momentum Projection**: Project resting position using exponential decay `(velocity / 1000) * (d / (1 - d))` with `d ≈ 0.998` to snap to the closest natural landing point.
- **Rubber-Banding at Boundaries**: Apply progressive logarithmic resistance when dragging past boundaries instead of hitting an abrupt hard stop.

```css
/* Tactile Button Class Standard */
.btn-interactive {
  transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease-out, box-shadow 140ms ease-out;
  will-change: transform;
}
.btn-interactive:active {
  transform: scale(0.97);
}
```

---

## 3. Optical Typography & Materials Architecture

### Optical Typography Rules
- **Negative Tracking on Large Display Type**: Display headings read too loose as font sizes grow. Always apply negative letter-spacing (`tracking-[-0.02em]` to `tracking-[-0.03em]`). Body text stays neutral (`tracking-normal`).
- **Inverse Leading (Line Height)**: Large display headings require tight leading (`line-height: 1.05 – 1.15`), whereas body copy requires generous breathing room (`line-height: 1.5 – 1.6`).
- **Hierarchy through Weight & Spacing**: Establish visual order through weight contrasts (font-bold/font-semibold) and generous whitespace rather than excessive font size scaling.

### Translucent Materials & Depth Scaffolding
- **Liquid Glass Materials**: Use `backdrop-filter: blur(20px) saturate(180%)` paired with semi-transparent surfaces (`rgba(255, 255, 255, 0.85)`).
- **Specular Top Edge Highlight**: Simulate physical light catching the top glass boundary using `box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)`.
- **Never Stack Light Translucent Surfaces on Top of Light Surfaces**: Stacking identical translucent materials destroys legibility. Separate layered surfaces with distinct opacity steps, contrasting borders, or subtle ambient shadows.

```css
/* Production Liquid Glass Standard */
.liquid-glass-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(166, 227, 233, 0.65);
  box-shadow: 0 20px 40px -15px rgba(113, 201, 206, 0.14), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9);
}
```

---

## 4. Interface Hardening & Defensive Engineering (`harden`, `audit`)

### Extreme Input Resilience
1. **Long Text & Truncation**:
   - Every text container inside flex or grid items must include `min-w-0` to prevent layout blowouts.
   - Long labels, titles, and IDs must use `.truncate` (single line) or `.line-clamp-2` / `.line-clamp-3` with `.break-words`.
2. **Empty & Loading States**:
   - Never render a blank screen. Empty states must provide actionable CTAs guiding the user forward.
   - Skeletons and spinners must indicate the exact asset or process being loaded.
3. **Error Boundaries & Form Value Preservation**:
   - When form submissions fail, never wipe user input.
   - Provide contextual, inline error guidance alongside direct retry buttons.

### Accessibility Standards (WCAG 2.2 AA/AAA)
- **Reduced Motion Support**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    .animate-blob, .btn-interactive:active {
      animation: none !important;
      transform: none !important;
    }
  }
  ```
- **Reduced Transparency Support**:
  ```css
  @media (prefers-reduced-transparency: reduce) {
    .liquid-glass, .liquid-glass-card {
      background: #ffffff !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
  }
  ```
- **Focus Rings**: Never remove `outline: none` without providing an accessible focus ring (`focus:ring-2 focus:ring-[#71C9CE]/20 focus:border-[#71C9CE]`).

---

## 5. Multi-Cloud BYOS Object Storage & Cryptography

### Zero-Egress, Direct-to-Storage Architecture
1. **Universal S3 Compatibility**:
   - Abstract object storage across **Supabase Storage**, **Cloudflare R2** ($0 egress), **AWS S3**, **Backblaze B2**, and **Wasabi**.
   - Generate time-limited (1800s) presigned `PUT` upload URLs dynamically.
   - Direct binary uploads bypass the Node.js API server, guaranteeing zero local disk footprint, zero memory buffering bottlenecks, and zero bandwidth transit fees.

### Cryptographic Security Protocol
- **AES-256-GCM / CTR Authenticated Encryption**:
  - Encrypt all user cloud secrets, S3 credentials, Supabase service keys, and YouTube OAuth refresh tokens before storing in PostgreSQL.
  - Structure cipher payloads with deterministic format: `IV:AuthTag:Ciphertext`.
  - Enforce key stretching and padding to 32 bytes (256 bits).

```typescript
// AES-256-GCM Encryption Reference
export function encryptToken(text: string, secret: string): string {
  if (!text) return '';
  const key = Buffer.from(secret.padEnd(64, '0').slice(0, 64), 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
```

### Supabase PostgreSQL & Row-Level Security (RLS)
- **IDOR Defense**: All API routes and SQL queries must bind user queries to authenticated JWT sessions (`auth.uid()`).
- **Unverified Registration Protection**: Restrict database profile generation and unique checks strictly to confirmed accounts (`email_confirmed_at IS NOT NULL`).

---

## 6. Full-Stack Quality & Review Gauntlet

### UI/UX Code Review Checklist

| Defect Pattern | Required Fix | Why |
| :--- | :--- | :--- |
| `transition: all 300ms` | `transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1), opacity 140ms ease-out` | Avoid animating layout triggers (`width`, `margin`); specify hardware-accelerated transforms. |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Objects in reality do not emerge from nothing. |
| `ease-in` on UI controls | `ease-out` or custom cubic-bezier | `ease-in` introduces sluggish input lag. |
| Hover scaling (`hover:scale-105`) | Active scale (`:active:scale(0.97)`) + subtle color hover | Hover scaling creates visual clutter; active press provides tactile confirmation. |
| Popover centered transform origin | `transform-origin: var(--transform-origin)` | Popovers must emerge directly from their triggering button. |
| Missing reduced motion query | `@media (prefers-reduced-motion: reduce)` | Required for vestibular safety and accessibility compliance. |
| Fixed pixel container widths | Responsive `min-w-0`, `max-w-*`, `break-words` | Prevents text overflow blowouts across internationalization and zoom. |

### Systematic Debugging & Release Hygiene
1. **Root Cause Analysis**: Never apply blind patches or timeout delays. Trace failures to specific lifecycle states, token invalidations, or network responses.
2. **Deterministic Waiting**: In automated testing (Playwright/Jest), wait for condition-based assertions (DOM state, network request completion) rather than arbitrary `sleep()` intervals.
3. **Zero-Downtime Deployment**: Verify health-check endpoints (`/health`, `/api/health`), environment variable bindings, and migration idempotency before promoting commits to production.
