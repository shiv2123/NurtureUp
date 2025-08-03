# NurtureUp – Master Product & Experience Specification

*Connects the Parent & Child blueprints and defines the full‑stack architecture, routing, and unified design language so an implementation AI can generate a production‑ready system without ambiguity.*

---

## 0 · Delivery Strategy (Web‑First)

We will **launch as a responsive web app (PWA)** first, then extend to iOS/Android native shells once UX, retention and analytics targets are met.

| Phase          | Target                                               | Notes                                             |
| -------------- | ---------------------------------------------------- | ------------------------------------------------- |
| **Alpha Web**  | Public URL behind invite (Vercel)                    | Desktop ≥1024 px + mobile viewport ≥375 px tested |
| **Beta Web**   | PWA installability, offline cache                    | Collect Core Web Vitals & engagement KPIs         |
| **Mobile MVP** | React Native wrappers using shared component library | Push notifications, biometrics, device sensors    |

**Tech Stack (Web α):** Next.js 14 (App Router), TypeScript, Radix UI primitives + Tailwind CSS (using design tokens), tRPC API layer to Firebase Functions.\
**PWA:** `serviceWorker` via Workbox – precaches critical routes, enables Add‑to‑Home‑Screen.

---

## 1 · Vision Recap

**NurtureUp is a life‑cycle “family operating system.”** One cloud account hosts:

- A **Parent app** that adapts from TTC → Adolescence.
- A **Child app** that evolves from Toddler → Teen.
- Shared backend services that sync data, enforce privacy contracts, and deliver context‑aware guidance.

All touch‑points share a **card‑based, modern, minimal UI** with delightful but restrained motion—drawing inspiration from the reference mock‑ups you provided while staying fully accessible.

---

## 2 · High‑Level Information Architecture

```
+-- Mobile Shell (React Native) ------------------------------------------+
|                                                                          |
|  ▸ Onboarding Flow (shared)                                              |
|  ▸ Role Resolver (Parent / Child)                                        |
|                                                                          |
|  ↳ ParentNav (Bottom Tabs)                                               |
|     • Home • Stage‑Specific Tab 1 • Tab 2 • Profile                      |
|                                                                          |
|  ↳ ChildNav (Bottom Tabs)                                                |
|     • Home • Stage‑Specific Tab 1 • Tab 2 • Tab 3                        |
|                                                                          |
|  ▸ Context Providers                                                     |
|     • AuthContext  • StageContext • SyncContext • ThemeContext           |
|                                                                          |
+--------------------------------------------------------------------------+
```

- **Dynamic Module Loader**: Each stage (Parent or Child) is packaged as a separate JS bundle, fetched via Expo OTA & feature flags.
- **App Shell** stays \~4 MB; stage bundles cached until version bump.

---

## 3 · Navigation & Routing Strategy

1. **React Navigation v7** with *Native Stack* (screen transitions) + *Bottom Tab* navigator.
2. **Stage‑Aware Tab Composer** – on login, `StageContext` builds tab config from remote JSON:
   ```json
   {
     "role": "parent",
     "stage": "toddler",
     "tabs": ["Home", "Routine", "Play", "Profile"]
   }
   ```
3. **Deep Link Schema** – `nurtureup://` supports `/child/{id}/log/feed`, `/parent/{id}/tracker?metric=weight`, etc.
4. **Push Notifications** open screens via `Linking` API—payload includes `deeplink` field.

---

## 4 · Unified Design Language

### 4.1 Card Paradigm

- **Container**: Radius = 16 px (parent) / 20 px (child ≤ 6 yrs).
- **Shadow**: `rgba(0,0,0,0.08)` offset `0 1 3` dp.
- **Padding**: 16 px horizontal, 12 px vertical.
- **Hierarchy**: Title 17 pt 600, Subtitle 15 pt 400, Meta 13 pt 400.

### 4.2 Color & Elevation

- Adopt tokens from both blueprints (Primary #4F8EF7, Secondary #F7B23D), with **tone‑down** at Teen stage (Primary darkens to #3E6ED8).
- Light & Dark themes generated via Figma Tokens → JSON.
- Card elevation: Home cards 2 dp, Modals 8 dp, FAB 12 dp.

### 4.3 Typography & Iconography

- **Nunito Sans** for friendly large‑text (≤ 12 yrs).
- **Inter** for data‑dense teen & parent screens.
- Icon set: Phosphor‑React for outline consistency; filled variant on press.

### 4.4 Motion Rules

- Enter screen 300 ms slide + fade.
- Card hover (web PWA) scale 1.02.
- Reward confetti pauses at Reduce‑Motion.

---

## 5 · Local Backend (Testing Mode – No Auth/Security)

During α & β web testing we run **entirely in local‑first mode**—no external auth, encryption, or cloud security gates. All data sits in the browser’s IndexedDB but we still need **real‑time cross‑device sync** between the Parent and Child UIs inside the local network.

### 5.1 Local Data Layer

| Module                      | Purpose                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **LocalStore**              | Dexie wrapper over IndexedDB with object stores: `families`, `children`, `tasks`, `logs`, `media`                     |
| **StageEngine (Local)**     | Pure TS class—computes stage from DOB, writes to LocalStore `stage_state`                                             |
| **CRDT Doc**                | Yjs document mirrors `tasks` + `stars` for conflict‑free real‑time merges                                             |
| **BroadcastChannel Bridge** | Notifies other tabs on same device of Yjs updates (zero‑latency)                                                      |
| **PeerBridge (LAN)**        | Simple‑Peer WebRTC mesh negotiated over QR Code or Manual PIN—propagates Yjs updates across devices on the same Wi‑Fi |
| **Media Cache**             | Blobs via FileReader; LRU 250 MB in IndexedDB `media` store                                                           |
| **Notification Stub**       | Browser Notification API; falls back to in‑app toast                                                                  |
| **AI Assistant (Offline)**  | transformers.js `tiny‑llama‑1.1b` in WebWorker; no network calls                                                      |

**Quick start flow:**

1. Parent creates family => Yjs doc seeded with `familyKey` UUID.
2. Child device scans QR (contains `familyKey` & WebRTC offer).
3. PeerBridge establishes direct datachannel; syncs full Yjs state (≈50 KB).
4. Subsequent updates broadcast delta (<1 KB) in <100 ms.

*No outside servers involved—everything stays on the local network / device.*

\------------ | ------- | | **LocalStore** | Wrapper around IndexedDB (Dexie) with per‑family object stores (`children`, `tasks`, `logs`, `media`) | | **StageEngine (Local)** | Pure TS class — computes stage from DOB, writes to LocalStore `stage_state` | | **Sync Stub** | Optional — manual “Sync to Firebase” button triggers one‑time upload using service account creds (disabled by default) | | **Media Cache** | Files saved via `FileReader` → `Blob URL`; purge policy LRU 250 MB | | **Notification Stub** | Uses browser Notification API; falls back to in‑app toast if permissions denied | | **AI Assistant (Offline)** | Runs transformers.js LLM `tiny‑llama-1.1b` in WebWorker; no network calls |

**Note:** All keys/secrets hard‑coded to `null` in test mode. Swap this table back to cloud services before production.

---

## 6 · Data Model Snapshot (Firestore)

```json
users/{uid}
  email
  role: "parent" | "child"
  locale
children/{childId}
  name
  dob
  stage: "early_childhood"
  avatar
  contracts { privacyLevel, screenTime }
  tasks { taskId → {...} }
  stars: int
  moodLogs { logId → {...} }
```

All writes batched; use `createdAt`, `updatedAt` server timestamps.

---

## 7 · Stage Transition Flow

1. **Detector** sets `nextStageAt` timestamp on `children/{id}`.
2. 14 days prior, Notification service sends *Preview Banner* deeplink.
3. On acceptance, Stage‑Engine writes `stage`, downloads new bundle manifest → triggers Expo OTA.
4. Old data migrated via Cloud Function migrators (`vitals.weight` → `logs.vitals.weight`).

Rollback: parent can revert within 48 h; Stage‑Engine retains previous bundle hash.

---

## 8 · Onboarding Funnel (Local Mode)

1. **Create Family** – first browser that visits `/setup` picks family name & passphrase (stored only locally).
2. **Add Child** – enter child name & DOB; LocalStore assigns `childId` UUID.
3. **Pair Child Device** – show QR containing serialized child object; scanning on another browser imports record.
4. **Tutorial Carousel** – still served but all analytics logs stay local (console).

When cloud sync toggled on (developer panel), Onboarding reverts to cloud flow.

---

## 9 · Offline & Sync Internals

- **Redux‑Persist + MMKV** caches writes.
- **SyncContext** flushes queue when `NetInfo` online; conflicts resolved by `updatedAt`.
- Photo uploads chunked <5 MB; progress events update UI.

---

## 10 · Security & Privacy (Deferred)

Authentication, encryption, and fine‑grained privacy contracts are **omitted during local testing**. The app runs:

- **No login** — family data keyed by browser `localStorage` GUID.
- **No network encryption** — because no network traffic in offline mode.
- **No COPPA enforcement** — testers must be adults under NDA.

▲ **Action:** Reinstate full Security Matrix (token scopes, Firestore rules, KMS) before any external pilot.

---

## 11 · CI/CD Pipeline

- **GitHub Actions**: lint, Jest, Type‑check, Detox, build artifacts.
- **Expo EAS** – auto‑deploy to TestFlight & Play Internal.
- **Danger.js** comments on PRs (coverage, bundle size diff).
- **Sentry** for crash + perf; Release names = commit SHA.

---

## 13 · UI Design Language – JSON Reference

The following JSON describes the **core design tokens, component specs, and layout rules** that every screen—parent and child—should follow. Import it into your design‑system generator or CSS‑in‑JS theme.

```json
{
  "designLanguage": {
    "breakpoints": {
      "xs": 320,
      "sm": 480,
      "md": 768,
      "lg": 1024,
      "xl": 1280
    },
    "spacingScale": [4, 8, 12, 16, 24, 32, 40],
    "radii": {
      "cardParent": 16,
      "cardChild": 20,
      "pill": 999
    },
    "elevation": {
      "card": 2,
      "modal": 8,
      "fab": 12
    },
    "colors": {
      "primary": "#4F8EF7",
      "primaryTeen": "#3E6ED8",
      "secondary": "#F7B23D",
      "backgroundLight": "#FFFFFF",
      "backgroundDark": "#18181B",
      "surfaceLight": "#F5F5F5",
      "surfaceDark": "#27272A",
      "success": "#3CC168",
      "warning": "#F7A53D",
      "danger": "#E45757",
      "outline": "rgba(0,0,0,0.08)"
    },
    "typography": {
      "fontFamilyChild": "Nunito Sans, system-ui, sans-serif",
      "fontFamilyParent": "Inter, system-ui, sans-serif",
      "sizes": {
        "h1": 28,
        "h2": 22,
        "h3": 19,
        "body": 16,
        "caption": 13
      },
      "weights": {
        "regular": 400,
        "medium": 500,
        "bold": 700
      }
    },
    "components": {
      "Card": {
        "paddingX": 16,
        "paddingY": 12,
        "radius": "{radii.cardParent}",
        "shadow": "0 1px 3px {colors.outline}"
      },
      "ButtonPrimary": {
        "height": 44,
        "radius": 12,
        "bg": "{colors.primary}",
        "textColor": "#FFFFFF",
        "shadow": "0 2px 4px rgba(0,0,0,0.12)"
      },
      "ButtonSecondary": {
        "height": 44,
        "radius": 12,
        "bg": "{colors.surfaceLight}",
        "border": "1px solid {colors.outline}",
        "textColor": "{colors.primary}"
      },
      "RingProgress": {
        "strokeWidth": 8,
        "bgTrack": "rgba(0,0,0,0.07)",
        "transition": "stroke-dashoffset 0.4s ease"
      }
    },
    "motion": {
      "easing": "cubic-bezier(0.25, 0.8, 0.5, 1)",
      "durations": {
        "xs": 150,
        "sm": 250,
        "md": 400,
        "lg": 700
      }
    }
  }
}
```

**Implementation Notes**

- Import as `design-tokens.json`; convert to Tailwind config (`tailwind.config.cjs`) and to Radix Primitive themes.
- Use **8‑pt grid**: every margin/padding multiple of spacing scale.
- Child screens ≤6 yrs use `cardChild` radius; Parent & Teen use `cardParent`.
- Dark mode derives surface/background colors from `surfaceDark`/`backgroundDark` while retaining brand primary/secondary.
- Lottie animations reference token colors via dynamic replace.

### 13.1 Layout Grid & Responsive Rules

```json
{
  "layout": {
    "containerWidths": {
      "sm": 480,
      "md": 720,
      "lg": 960,
      "xl": 1140
    },
    "columns": 12,
    "gutter": 16,
    "margin": 16,
    "maxContentWidth": 1280,
    "cardGap": 16,
    "safeAreaPadding": 12
  }
}
```

- Mobile <480 px: 1‑column card stack.
- Tablet ≥768 px: 2‑column grid; FAB relocates bottom‑right 24 px inside safe area.
- Desktop ≥1024 px: 3‑column grid; sidebar nav replaces bottom tabs.

### 13.2 Component Variants & States

```json
{
  "components": {
    "TextField": {
      "variants": ["default", "error", "disabled"],
      "placeholderColor": "#BDBDBD",
      "radius": 12,
      "height": 44,
      "shadowFocus": "0 0 0 2px {colors.primary}33"
    },
    "Chip": {
      "sizes": {"sm": 20, "md": 28},
      "bg": "{colors.surfaceLight}",
      "bgActive": "{colors.primary}1A",
      "text": "{colors.primary}",
      "iconSize": 14
    },
    "ProgressBar": {
      "height": 8,
      "radius": 4,
      "track": "{colors.surfaceDark}1A",
      "fill": "{colors.primary}",
      "animation": "width 0.4s {motion.easing}"
    }
  }
}
```

Interaction guidelines:

- **Hover (desktop)** – card shadow elevates to 4 dp, translateY(‑2 px).
- **Pressed** – card scales 0.98, shadow removed.
- **Focus (keyboard)** – 2 px outline in `{colors.primary}`.

### 13.3 Sample Card Anatomy (Figma Layers)

1. **Card/Base** – `AutoLayout` horizontal: padding 16/12.
2. **Icon** – 40×40 px circle, Tint `{colors.primary}` at 10 % opacity.
3. **Content Stack** – Title, Subtitle, Meta (AutoLayout vertical 4 px gap).
4. **CTA** – optional chevron/right icon 24 px.

### 13.4 Navigation Controls

- Bottom Tab Icons: 28 px outline, label 11 pt; selected tint `{colors.primary}`; indicator bar 3 px height.
- FAB: 56 px; icon 28 px; shadow 0 4 6 rgba(0,0,0,0.15).
- AppBar: height 56 px mobile, 64 px desktop; drop‑shadow 0 1 2 5 % opacity.

### 13.5 Dark Mode Mapping

| Token Role | Light              | Dark                     |
| ---------- | ------------------ | ------------------------ |
| background | `#FFFFFF`          | `#18181B`                |
| surface    | `#F5F5F5`          | `#27272A`                |
| outline    | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.10)` |
| textMain   | `#0F0F0F`          | `#F5F5F5`                |
| cardShadow | `rgba(0,0,0,0.08)` | `rgba(0,0,0,0.50)`       |

### 13.6 Illustration & Icon Style

- Stroke weight 1.5 px, rounded caps.
- Primary illustrations use softly‑blended gradients referencing `{colors.primary}` & `{colors.secondary}` at 30 %.

### 13.7 Grid Examples (Inspiration Applied)

- **Task List** card stack (see example 830e85d5 png) → we use pill status tags (To‑do, In progress) with Chip component; progress bar uses ProgressBar token.
- **Calendar Pill Navigation** (see 07fe… png middle) → reuse Chip `sm` variant; active pill filled with `{colors.primary}`10 %.
- **Metric Dashboard Tiles** (see ee8d… png) → Card variants with accent border left 4 px in token color.

### 13.8 Template Library (Blueprint ↔ UI Mapping)

| Blueprint Module        | Template             | Components                          | Notes                                    |
| ----------------------- | -------------------- | ----------------------------------- | ---------------------------------------- |
| Parent Home (Pregnancy) | **Dashboard‑A**      | AppBar + CardGrid (3) + FAB         | uses RingProgress + Card CTA spots       |
| Child Star Jar          | **Gamify‑Star**      | HeroCanvas + RingTimers + ActionRow | radial confetti emitter from Motion spec |
| Homework Tracker        | **List‑Tasks**       | FilterChips + TaskCard stack        | TaskCard supports swipe actions          |
| Calendar/Planner        | **Calendar‑Pill**    | WeekPills + ScrollList              | pills built from Chip `sm`, scroll snap  |
| Mood Check‑In           | **Modal‑Slider**     | EmojiSlider + HistoryGraph          | gradient bg anim fades w/ emotion        |
| Reward Store            | **Grid‑Marketplace** | ProductCard (square) + FAB Cart     | lazy‑loads; skeleton variant             |

### 13.9 Stage‑Specific Theme Tokens

```json
{
  "stageThemes": {
    "toddler": {
      "primary": "#FFB13D",
      "surface": "#FFF7EB"
    },
    "earlyChildhood": {
      "primary": "#4F8EF7",
      "surface": "#EEF4FF"
    },
    "schoolAge": {
      "primary": "#3E6ED8",
      "surface": "#E9EEFF"
    },
    "adolescence": {
      "primary": "#2E4A9F",
      "surface": "#1F2330"
    }
  }
}
```

At runtime ThemeContext merges `stageThemes[child.stage]` into base tokens.

### 13.10 Motion & Gesture Catalog

| Interaction      | Animation                                                         | Timing  | Easing | Haptic         |
| ---------------- | ----------------------------------------------------------------- | ------- | ------ | -------------- |
| Add Star         | Confetti burst (8 particles) + star jar shake                     | 700 ms  | md     | lightImpact    |
| Drag Task → Done | Card follows finger, alpha 0.9 → 1; drop snap & ProgressBar flash | 400 ms  | md     | success        |
| Tab Change       | Slide‑in along x‑axis 24 px, fade                                 | 250 ms  | sm     | selectionClick |
| Modal Open       | Scale 0.95 → 1 + fade                                             | 250 ms  | sm     | lightImpact    |
| SOS Long‑Press   | Progress ring fill, vibrate pattern 3×                            | 1500 ms | linear | warning        |

### 13.11 Skeleton & Loading States

- **CardSkeleton** – 100 % width, height matches template; bg `surfaceDark`10 %, shimmer left→right 1.2 s.
- **AvatarSkeleton** – 40 px circle, shimmer.
- Use Suspense boundaries per route; fallback = skeleton variant of template.

### 13.12 Accessibility Token Matrix

| Token                      | Contrast Pair (light)  | Ratio                |
| -------------------------- | ---------------------- | -------------------- |
| textMain on background     | `#0F0F0F` on `#FFFFFF` | 21:1                 |
| textMain on surface        | `#0F0F0F` on `#F5F5F5` | 14:1                 |
| primary on background      | `#4F8EF7` on `#FFFFFF` | 4.5:1                |
| danger on background       | `#E45757` on `#FFFFFF` | 4.9:1                |
| disabledText on background | `#BDBDBD` on `#FFFFFF` | 3.3:1 (non‑critical) |

Pass WCAG AA for all interactive labels.

### 13.13 CSS Variable Mapping Snippet

```css
:root {
  --nu-color-primary: #4F8EF7;
  --nu-color-surface: #F5F5F5;
  --nu-radius-card: 16px;
  --nu-spacing-4: 16px;
  --nu-font-body: "Inter", system-ui, sans-serif;
}
[data-stage="toddler"] {
  --nu-color-primary: #FFB13D;
  --nu-color-surface: #FFF7EB;
}
[data-theme="dark"] {
  --nu-color-surface: #27272A;
  --nu-color-text: #F5F5F5;
}
```

All build tools (Tailwind, Styled Components) reference these vars via `theme()` or `var(--nu-*)`.

> *Designers should update token JSON & CSS variables in tandem; dev pipeline auto‑syncs Tailwind config.*

*All designers & devs should reference **``**, Template Library, and Motion Catalog for pixel‑perfect, accessible, and cohesive UI across platforms.*

---

## 14 · Developer Environment & Project Structure (Local‑First)

### 14.1 Prerequisites

| Tool | Version | Purpose                  |
| ---- | ------- | ------------------------ |
| Node | ≥ 20.10 | ESM + Bun compatibility  |
| pnpm | ≥ 8.0   | Monorepo package manager |
|      |         |                          |
|      |         |                          |



### 14.2 Monorepo Layout example

```
packages/
  ui/               # Radix + Tailwind component library
  core/             # StageEngine, CRDT adapter, design tokens JSON
  hooks/            # React hooks (useStage, useLocalStore)
apps/
  web/              # Next.js 14 PWA
    public/
    app/
      (routes)
    components/     # Project‑specific wrappers
    pages/          # Legacy pages (auth callbacks later)
    tailwind.config.cjs
    next.config.mjs
  devtools/         # Storybook 7, Loki visual regression
scripts/
  generate‑tokens.mjs  # Syncs design‑tokens.json → Tailwind & CSS vars
  fixture‑seed.mjs     # Creates demo family.yml → IndexedDB via Dexie
```

### 14.3 Key NPM Scripts (root `package.json`)

| Script      | Command                                                             | Description                              |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------- |
| `dev`       | `pnpm --filter web dev`                                             | Runs Next.js in dev mode with hot reload |
| `storybook` | `pnpm --filter devtools storybook`                                  | Local component sandbox on port 6006     |
| `test`      | `vitest run`                                                        | Unit tests across packages               |
| `lint`      | `eslint . --ext .ts,.tsx`                                           | Lint all TS/TSX files                    |
| `format`    | `prettier --write .`                                                | Auto‑format                              |
| `build`     | `pnpm --filter web build && pnpm --filter devtools build-storybook` | Production build                         |
| `serve`     | `pnpm --filter web start`                                           | Starts built app on port 3000            |

### 14.4 Environment Variables (`.env.local`)

```
NEXT_PUBLIC_APP_NAME=NurtureUp
NEXT_PUBLIC_VERSION=0.1.0-alpha
# Stubbed Firebase creds (null during local testing)
NEXT_PUBLIC_FIREBASE=false
```

No secrets are required in local mode.

### 14.5 Seed Data & Fixtures

Running `pnpm fixture‑seed` inserts a demo family:

```yaml
familyName: DemoSmiths
children:
  - id: demo-toddler
    name: Sam
    dob: 2022-04-01
    stage: toddler
  - id: demo-school
    name: Riley
    dob: 2015-09-15
    stage: schoolAge
```

Fixtures load via Dexie on first boot, enabling immediate UI testing without manual entry.

### 14.6 Logging & Debugging

- **Console Groups**: `localStore`, `crdt`, `peer` namespaces.
- **Debug Panel** (`/debug` route): shows IndexedDB content, CRDT vector clocks, active peers.
- **Redux DevTools** integrated via `@redux-devtools/extension` toggle.

---

## 15 · Open Tasks & Next Iterations

- Design system tokens → publish to `@nurtureup/design-tokens` NPM.
- Build `StageEngine` Cloud Run (TypeScript) with unit tests.
- Create automated visual regression CI with Loki + Storybook.
- Implement Remote Config gating for AI Assistant beta when it is worked on later.

---
