# VibeShift — Frontend Redesign Skills Manifest & Architecture Guide

**Repository:** `https://github.com/milumathew-21/VibeShift`  
**Branch:** `feature/frontend-visual-redesign` (branched from `origin/feature/frontend-combined`)  
**Project Skills Directory:** `.agents/skills/`  
**Target Agent:** Google Antigravity (`antigravity`, workspace scope)

---

## 1. Overview & Visual Direction Reference

This document catalogs the curated collection of frontend design, UI/UX intelligence, typography, motion, 3D WebGL, React performance, accessibility, and browser verification skills installed for the upcoming **VibeShift** visual redesign.

### Future Visual Direction Reference (`Impact Flow`)
- **Reference Inspiration:** `https://framer.link/VJ04aIL` (*Impact Flow — Digital Marketing Agency Framer Template*)
- **Core Aesthetic Qualities to Extract & Adapt for VibeShift:**
  - Deep atmospheric dark surfaces (`#05050A` to `#0E111D`) paired with luminous, mood-reactive accent gradients
  - Editorial display typography with deliberate contrast in weight, tracking, and hierarchy
  - High-craft bento and asymmetrical card compositions with crisp 1px hairlines
  -Choreographed scroll reveals, subtle magnetic/spring micro-interactions, and purposeful 3D reactive audio-mood visuals
  - Strict avoidance of generic AI SaaS templates, stock hero split-layouts, and uncoordinated color noise

> **Important Scope Note:** This branch milestone installs, security-audits, validates, and documents the skill toolkit in `.agents/skills/`. Application code in `frontend/src/` and backend contracts remain untouched until the redesign execution phase begins.

---

## 2. Skill Priority Order (Conflict Resolution Hierarchy)

Because multiple skills provide overlapping guidance on layout, motion, and styling, Antigravity must resolve any conflict using this strict **8-level priority order**:

1. **VibeShift Functional & API Requirements**  
   All Member 1 (Prapthi) + Member 2 (Saakshi) user journeys, FastAPI contracts (`docs/api-contract`), Demo/Live mode switching, mood detection, Match/Change mood strategy, recommendations, playback telemetry, and Mood Journey analytics always take top priority.
2. **Impact Flow Reference Visual Direction (`https://framer.link/VJ04aIL`)**  
   Dark atmospheric surfaces, editorial typography, bold spatial hierarchy, and Framer-grade polish govern the visual tone.
3. **`frontend-design` + `redesign-existing-projects` *(workflow methodology)* — Overall Aesthetic & Redesign Direction**  
   Establishes the art direction, anti-generic composition rules, and structured audit-before-rewrite workflow.
4. **`ui-ux-pro-max` + `impeccable` — Design System, Spacing, Typography & Visual Polish**  
   Governs token scales, WCAG contrast, font pairings, component density, and iterative UI critique/refinement.
5. **`gsap-react` + `gsap-scrolltrigger` — Motion & Scroll Choreography**  
   Governs `useGSAP()` lifecycle safety, entrance timelines, pinned/scrubbed scroll narratives, and `prefers-reduced-motion` compliance.
6. **`threejs-r3f` — 3D Mood Orb & Interactive Visuals**  
   Governs React Three Fiber `<Canvas>` performance, shaders, lighting, frame-loop (`useFrame`) discipline, and WebGL fallback boundaries.
7. **`vercel-react-best-practices` + `web-design-guidelines` — Code Quality, Accessibility & Responsiveness**  
   Governs React rendering performance, bundle hygiene, semantic HTML, keyboard focus rings, form usability, and responsive breakpoints.
8. **`playwright-cli` — Visual & Interaction Verification**  
   Governs live browser layout inspection, responsive viewport checks, and automated interaction verification.

---

## 3. Summary Status Table of Requested Skills

| # | Requested Skill | Source Repository | Status | Installed Path | Source Commit SHA | Security Verification |
|---|---|---|---|---|---|---|
| 1 | `frontend-design` | `https://github.com/anthropics/skills` | **Installed** | `.agents/skills/frontend-design/` | `2c5958ecac7cee2b583967a2c4981d0f4a75c579` | Safe — pure Markdown (`SKILL.md` + `LICENSE.txt`), no scripts or hooks |
| 2 | `ui-ux-pro-max` | `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` | **Installed** | `.agents/skills/ui-ux-pro-max/` | `6ae86f61f520d6ca229d2f40e070410638c908c5` | Safe — offline Python 3 stdlib BM25 search over local CSV datasets (`data/*.csv`) |
| 3 | `impeccable` | `https://github.com/pbakaus/impeccable` | **Installed** *(Safe Mode)* | `.agents/skills/impeccable/` | `1995764b4936f2bfbf4eb719cb37b384a45ceacb` | Audited — 49 Markdown references in `reference/` work directly via `read_file`; binary launcher `scripts/impeccable` **not executed** (requires manual approval if used) |
| 4 | `redesign-existing-projects` | `https://github.com/tasteskill/tasteskill` | **Skipped (Repo 404)** | *Not installed* | N/A (`404 Not Found`) | Blocked per Section 5 security policy — requested GitHub URL does not exist; unapproved third-party publisher not substituted |
| 5 | `image-to-code` | `https://github.com/tasteskill/tasteskill` | **Skipped (Repo 404)** | *Not installed* | N/A (`404 Not Found`) | Blocked per Section 5 security policy — requested GitHub URL does not exist; unapproved third-party publisher not substituted |
| 6 | `threejs-r3f` | `https://github.com/cesartevisual/threejs-skills` | **Installed** | `.agents/skills/threejs-r3f/` | `84f9bcb4bea1f7a28d57fe7f0af78f7f9c3dc467` | Safe — pure Markdown (`SKILL.md`), no scripts or binaries |
| 7 | `gsap-react` | `https://github.com/greensock/gsap-skills` | **Installed** | `.agents/skills/gsap-react/` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | Safe — official GreenSock pure Markdown (`SKILL.md`) |
| 8 | `gsap-scrolltrigger` | `https://github.com/greensock/gsap-skills` | **Installed** | `.agents/skills/gsap-scrolltrigger/` | `aed9cfd3277740755f6bfc1155c7aa645403b760` | Safe — official GreenSock pure Markdown (`SKILL.md`) |
| 9 | `vercel-react-best-practices` | `https://github.com/vercel-labs/agent-skills` | **Installed** | `.agents/skills/vercel-react-best-practices/` | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | Safe — pure Markdown (`SKILL.md`, `AGENTS.md`, `rules/*.md`), no executable scripts |
| 10 | `web-design-guidelines` | `https://github.com/vercel-labs/agent-skills` | **Installed** | `.agents/skills/web-design-guidelines/` | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | Audited — Markdown skill that instructs a read-only fetch of Vercel's public `command.md` rules file during audits |
| 11 | `playwright-cli` | `https://github.com/microsoft/playwright-cli` | **Installed** | `.agents/skills/playwright-cli/` | `b21724888b8100b05ef8dee3a92f2bb03bf4dcde` | Audited — official Microsoft skill docs (`SKILL.md` + `references/*.md`); no global npm packages or browser binaries installed automatically |

---

## 4. Detailed Skill Documentation

### Skill 1 — `frontend-design`
- **Skill Name:** `frontend-design`
- **Source Repository URL:** `https://github.com/anthropics/skills` (`skills/frontend-design`)
- **Installed Version / Commit SHA:** `2c5958ecac7cee2b583967a2c4981d0f4a75c579`
- **Local Installation Path:** `.agents/skills/frontend-design/`
- **Purpose:** Establishes bold, memorable art direction, distinctive typography, cohesive dark/atmospheric color systems, asymmetric spatial compositions, and high-impact motion while eliminating generic AI-generated layouts.
- **Dependencies:** None (pure instructional skill).
- **Security Notes:** Inspected `SKILL.md` and `LICENSE.txt`. Contains zero scripts, shell commands, hooks, or external network requests.
- **How to Invoke:**
  - Automatically activated by Antigravity when designing or styling UI components, or explicitly in chat: *"Use the `frontend-design` skill to establish the Impact Flow visual direction for VibeShift."*
- **VibeShift Redesign Stage:** **Stage 1 (Art Direction & Design Tokens)** and **Stage 2 (Landing Page & Hero Redesign)**.

---

### Skill 2 — `ui-ux-pro-max`
- **Skill Name:** `ui-ux-pro-max`
- **Source Repository URL:** `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` (`.claude/skills/ui-ux-pro-max`)
- **Installed Version / Commit SHA:** `6ae86f61f520d6ca229d2f40e070410638c908c5`
- **Local Installation Path:** `.agents/skills/ui-ux-pro-max/`
- **Purpose:** Provides data-driven UI/UX intelligence across 12 domains (`style`, `color`, `typography`, `google-fonts`, `landing`, `chart`, `ux`, `react`, `web`, `gsap`, `icons`, `product`) and 22 technology stacks, with configurable 1–10 dials for `DESIGN_VARIANCE`, `MOTION_INTENSITY`, and `VISUAL_DENSITY`.
- **Dependencies:** Python 3 standard library only (`csv`, `json`, `re`, `math`, `pathlib`, `argparse`, `difflib`). Zero third-party pip packages required.
- **Security Notes:** Audited `scripts/search.py`, `scripts/core.py`, `scripts/design_system.py`, `scripts/reasoning_contract.py`, and `scripts/validate_data.py`. The scripts run 100% offline against `.agents/skills/ui-ux-pro-max/data/*.csv` and make no network calls. File writes occur only if `--persist` is explicitly passed.
- **How to Invoke:**
  - Read `.agents/skills/ui-ux-pro-max/SKILL.md` and `references/pro-rules.md`.
  - Run read-only design system queries from the repository root:
    ```powershell
    python .agents/skills/ui-ux-pro-max/scripts/search.py "AI adaptive music streaming dark mode" --design-system -p "VibeShift" --variance 8 --motion 8 --density 4
    ```
  - Run domain-specific queries (e.g., typography, charts, or React stack guidelines):
    ```powershell
    python .agents/skills/ui-ux-pro-max/scripts/search.py "editorial display sans dark audio" --domain typography
    python .agents/skills/ui-ux-pro-max/scripts/search.py "mood timeline emotion chart" --domain chart
    ```
- **VibeShift Redesign Stage:** **Stage 1 (Design System & Token Calibration)**, **Stage 3 (Dashboard, Mood Selection & Music Player UX)**, and **Stage 4 (Mood Journey Data Visualization)**.

---

### Skill 3 — `impeccable`
- **Skill Name:** `impeccable`
- **Source Repository URL:** `https://github.com/pbakaus/impeccable` (`.agents/skills/impeccable`)
- **Installed Version / Commit SHA:** `1995764b4936f2bfbf4eb719cb37b384a45ceacb` (Engine spec `4.0.4`)
- **Local Installation Path:** `.agents/skills/impeccable/`
- **Purpose:** High-craft UI refinement, anti-slop critique rubrics, optical spacing/alignment, typographic hierarchy (`typeset`), dark-mode color calibration (`colorize`), layout rhythm (`layout`), and micro-interaction polish (`polish`, `animate`, `delight`, `overdrive`).
- **Dependencies:** None when used in Antigravity Direct-Reference Mode (`read_file` on `.agents/skills/impeccable/reference/*.md`).
- **Security Notes (Manual Approval Gate for Binary Launcher):**
  - Installed strictly inside `.agents/skills/impeccable/` without adding global IDE hooks or `.claude` settings.
  - Audited `scripts/impeccable` (POSIX shell) and `scripts/impeccable.cmd` (Windows batch). Those launcher scripts attempt to download a precompiled platform binary (`impeccable-windows-x64.exe`) from `https://github.com/pbakaus/impeccable/releases/download` into `%USERPROFILE%\.impeccable\bin\`.
  - Per Section 4 & Section 5 security rules, **the binary launcher was NOT executed**, and no external binary was downloaded.
  - `SKILL.md` explicitly documents a degraded/unavailable-launcher fallback where the agent reads `reference/*.md` (`craft.md`, `critique.md`, `critique-rubric.md`, `typeset.md`, `colorize.md`, `layout.md`, `polish.md`, `animate.md`, `harden.md`, etc.) directly using standard file-reading tools. Always use this direct-read workflow unless the user explicitly approves running `scripts/impeccable.cmd`.
- **How to Invoke:**
  - Read `.agents/skills/impeccable/SKILL.md` and the relevant reference file in `.agents/skills/impeccable/reference/` (e.g., `reference/craft.md`, `reference/critique.md`, `reference/polish.md`, `reference/typeset.md`, `reference/layout.md`).
- **VibeShift Redesign Stage:** **Stage 1 (Design Foundations)**, **Stage 3 (Component Craft & Alignment)**, and **Stage 5 (Final UI Critique & Polish Pass)**.

---

### Skill 4 — `redesign-existing-projects` *(Skipped — Source Repository Not Found)*
- **Requested Skill Name:** `redesign-existing-projects`
- **Requested Source Repository URL:** `https://github.com/tasteskill/tasteskill`
- **Status:** **Skipped (Missing Repository — HTTP 404)**
- **Security & Verification Report:**
  - Attempting to clone or query `https://github.com/tasteskill/tasteskill` returned `remote: Repository not found`.
  - Web verification indicated that similarly named skills (`redesign-skill` / `taste-skill`) exist under a different, unapproved GitHub account (`https://github.com/Leonxlnx/taste-skill-classics` and `https://github.com/Leonxlnx/taste-skill`).
  - In strict compliance with **Section 5 (Mandatory Security Verification)**: *"If a skill cannot be safely verified, skip it and report why. Do not substitute an unknown repository just because its skill name is similar."*
  - **Coverage Mitigation:** Existing project audit and incremental upgrade workflows are covered by combining `impeccable` (`reference/audit.md`, `reference/critique.md`, `reference/extract.md`, `reference/shape.md`) with `frontend-design` and `ui-ux-pro-max`. If the team wishes to install from `Leonxlnx/taste-skill-classics`, explicit user approval of that repository URL is required first.

---

### Skill 5 — `image-to-code` *(Skipped — Source Repository Not Found)*
- **Requested Skill Name:** `image-to-code`
- **Requested Source Repository URL:** `https://github.com/tasteskill/tasteskill`
- **Status:** **Skipped (Missing Repository — HTTP 404)**
- **Security & Verification Report:**
  - As with Skill 4, `https://github.com/tasteskill/tasteskill` does not exist on GitHub (`404 Not Found`).
  - Per **Section 5**, no unapproved third-party repository was substituted.
  - **Coverage Mitigation:** Translating visual reference screenshots (`https://framer.link/VJ04aIL`) into clean React components is handled natively by Antigravity's multimodal vision paired with `frontend-design`, `impeccable/reference/new-work-comp.md`, and `vercel-react-best-practices`.

---

### Skill 6 — `threejs-r3f`
- **Skill Name:** `threejs-r3f`
- **Source Repository URL:** `https://github.com/cesartevisual/threejs-skills` (`skills/threejs-r3f`)
- **Installed Version / Commit SHA:** `84f9bcb4bea1f7a28d57fe7f0af78f7f9c3dc467`
- **Local Installation Path:** `.agents/skills/threejs-r3f/`
- **Purpose:** Guides React Three Fiber (`@react-three/fiber`) and `@react-three/drei` architecture, declarative `<Canvas>` setup, `useFrame` delta-time animation loops, custom `shaderMaterial` uniforms, geometry/material disposal, and GPU performance optimization.
- **Dependencies:** Uses existing frontend packages already installed in `frontend/package.json` (`three`, `@react-three/fiber`, `@react-three/drei`).
- **Security Notes:** Pure Markdown (`SKILL.md`). Zero scripts, hooks, or external network calls.
- **How to Invoke:**
  - Read `.agents/skills/threejs-r3f/SKILL.md` before modifying `frontend/src/components/three/MoodOrbCanvas.jsx` or any 3D visual scene.
- **VibeShift Redesign Stage:** **Stage 2 (Interactive 3D Mood Orb & Ambient Shader Upgrade)**.

---

### Skill 7 — `gsap-react`
- **Skill Name:** `gsap-react`
- **Source Repository URL:** `https://github.com/greensock/gsap-skills` (`skills/gsap-react`)
- **Installed Version / Commit SHA:** `aed9cfd3277740755f6bfc1155c7aa645403b760`
- **Local Installation Path:** `.agents/skills/gsap-react/`
- **Purpose:** Official GreenSock skill for integrating GSAP in React using the `useGSAP()` hook, automatic `gsap.context()` cleanup on unmount, container scoping (`{ scope: containerRef }`), event-safe callbacks (`contextSafe`), and `gsap.matchMedia()` for reduced-motion accessibility.
- **Dependencies:** If GSAP animations are introduced alongside Framer Motion during the redesign, `gsap` and `@gsap/react` will be added to `frontend/package.json` during the implementation phase (not installed during this skill-setup task).
- **Security Notes:** Official GreenSock pure Markdown (`SKILL.md`). Zero scripts, hooks, or external requests.
- **How to Invoke:**
  - Read `.agents/skills/gsap-react/SKILL.md` whenever authoring GSAP component transitions, magnetic buttons, or staggered card entrances in React.
- **VibeShift Redesign Stage:** **Stage 2 (Hero & Navigation Choreography)** and **Stage 3 (Interactive Micro-Interactions)**.

---

### Skill 8 — `gsap-scrolltrigger`
- **Skill Name:** `gsap-scrolltrigger`
- **Source Repository URL:** `https://github.com/greensock/gsap-skills` (`skills/gsap-scrolltrigger`)
- **Installed Version / Commit SHA:** `aed9cfd3277740755f6bfc1155c7aa645403b760`
- **Local Installation Path:** `.agents/skills/gsap-scrolltrigger/`
- **Purpose:** Official GreenSock skill for scroll-driven animations, `ScrollTrigger` start/end viewport coordinates, smooth scrubbing (`scrub: 1`), section pinning (`pin: true`), batch reveals (`ScrollTrigger.batch`), and `ScrollTrigger.refresh()` lifecycle synchronization.
- **Dependencies:** Requires `gsap` (`gsap/ScrollTrigger`) if used during the redesign phase.
- **Security Notes:** Official GreenSock pure Markdown (`SKILL.md`). Zero scripts, hooks, or external requests.
- **How to Invoke:**
  - Read `.agents/skills/gsap-scrolltrigger/SKILL.md` when building Impact Flow-style scroll storytelling sections on the VibeShift landing page and Mood Journey showcase.
- **VibeShift Redesign Stage:** **Stage 2 (Landing Page Scroll Storytelling)** and **Stage 4 (Mood Journey Scroll Reveals)**.

---

### Skill 9 — `vercel-react-best-practices`
- **Skill Name:** `vercel-react-best-practices`
- **Source Repository URL:** `https://github.com/vercel-labs/agent-skills` (`skills/react-best-practices`)
- **Installed Version / Commit SHA:** `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` (Skill version `1.0.0`)
- **Local Installation Path:** `.agents/skills/vercel-react-best-practices/`
- **Purpose:** Provides 62 prioritized React engineering rules across 8 categories (eliminating async waterfalls, bundle size & barrel import hygiene, client data fetching, re-render optimization, passive event listeners, DOM/CSS rendering performance, and JS hot-path optimization).
- **Dependencies:** None (pure Markdown rule library in `SKILL.md`, `AGENTS.md`, and `rules/*.md`).
- **Security Notes:** Audited `SKILL.md`, `AGENTS.md`, `metadata.json`, and all 62 files in `rules/*.md`. Contains zero executable scripts or hooks.
- **How to Invoke:**
  - Read `.agents/skills/vercel-react-best-practices/SKILL.md` (and `AGENTS.md` or individual `rules/*.md` files) during component refactoring and before final PR verification.
- **VibeShift Redesign Stage:** **Stage 3 (Component Refactoring)** and **Stage 5 (Performance & Re-render Audit)**.

---

### Skill 10 — `web-design-guidelines`
- **Skill Name:** `web-design-guidelines`
- **Source Repository URL:** `https://github.com/vercel-labs/agent-skills` (`skills/web-design-guidelines`)
- **Installed Version / Commit SHA:** `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` (Skill version `1.0.0`)
- **Local Installation Path:** `.agents/skills/web-design-guidelines/`
- **Purpose:** Audits frontend code for compliance with Vercel's Web Interface Guidelines covering semantic HTML, keyboard focus visibility, ARIA labels, form controls, typography truncation/wrapping, layout resilience, and touch targets.
- **Dependencies:** None.
- **Security Notes:** Audited `SKILL.md`. Contains no local executable scripts. Note that `SKILL.md` instructs fetching the latest read-only guideline markdown from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` when performing a live audit; in offline/sandboxed environments, pair with `.agents/skills/ui-ux-pro-max/data/app-interface.csv` and `ux-guidelines.csv` which embed the same web interface & accessibility rules locally.
- **How to Invoke:**
  - Read `.agents/skills/web-design-guidelines/SKILL.md` during accessibility, keyboard navigation, and responsive UI reviews.
- **VibeShift Redesign Stage:** **Stage 5 (Accessibility, Keyboard Navigation & Responsive QA)**.

---

### Skill 11 — `playwright-cli`
- **Skill Name:** `playwright-cli`
- **Source Repository URL:** `https://github.com/microsoft/playwright-cli` (`skills/playwright-cli`, official docs at `https://playwright.dev/agent-cli/installation`)
- **Installed Version / Commit SHA:** `b21724888b8100b05ef8dee3a92f2bb03bf4dcde` (Skill version `2.0`)
- **Local Installation Path:** `.agents/skills/playwright-cli/`
- **Purpose:** Provides token-efficient CLI commands and reference workflows (`references/element-attributes.md`, `references/running-code.md`, `references/session-management.md`, `references/tracing.md`, `references/video-recording.md`, etc.) for navigating localhost pages, inspecting accessibility snapshots, resizing viewports, capturing screenshots, and verifying interactive UI flows.
- **Dependencies:**
  - Requires the `@playwright/cli` binary (`playwright-cli` or `npx @playwright/cli`) only when executing live CLI browser commands. Per project safety rules, **no global npm packages or browser binaries were automatically installed** during this setup task.
  - Antigravity can also use its built-in `browser` subagent alongside these verification patterns.
- **Security Notes:** Audited `SKILL.md` and all 10 files in `references/*.md`. Contains only Markdown documentation — no shell scripts, hooks, or binaries were installed into the repository.
- **How to Invoke:**
  - Read `.agents/skills/playwright-cli/SKILL.md` when planning or running end-to-end visual and interaction checks against `http://localhost:5173`.
- **VibeShift Redesign Stage:** **Stage 5 (Live Browser Visual & Responsive Verification)**.

---

## 5. Redesign Execution Roadmap (How Skills Map to Stages)

When the VibeShift visual redesign begins on `feature/frontend-visual-redesign`, apply the installed skills in these five structured stages:

| Stage | Focus Area | Primary Skills to Activate | Key Deliverables |
|---|---|---|---|
| **Stage 1** | **Design System & Impact Flow Tokens** | `frontend-design`, `ui-ux-pro-max`, `impeccable` (`foundations.md`, `typeset.md`, `colorize.md`) | Updated CSS custom properties, display + editorial typography scale, atmospheric dark palette, mood token ramps, and card border/surface system |
| **Stage 2** | **Landing Page, 3D Mood Orb & Scroll Storytelling** | `frontend-design`, `threejs-r3f`, `gsap-react`, `gsap-scrolltrigger` | Impact Flow-inspired asymmetric hero, upgraded 3D WebGL Mood Orb shader/lighting, pinned/scrubbed feature showcase, and smooth navigation bar |
| **Stage 3** | **Core App Flows (Dashboard, Mood Detection, Match/Change, Preferences & Player)** | `ui-ux-pro-max`, `impeccable` (`craft.md`, `layout.md`, `animate.md`), `vercel-react-best-practices` | High-craft camera/manual/text mood capture cards, tactile Match vs. Change strategy selector, glassmorphic persistent audio player, and like/skip/replay micro-interactions |
| **Stage 4** | **Mood Journey Analytics & Session Recheck** | `ui-ux-pro-max` (`chart` domain), `impeccable` (`visualize.md`), `gsap-scrolltrigger` | Redesigned Mood Journey timeline, before/after emotion transition cards, and session effectiveness metrics |
| **Stage 5** | **Critique, Accessibility, Performance & Browser QA** | `impeccable` (`critique.md`, `polish.md`, `harden.md`), `vercel-react-best-practices`, `web-design-guidelines`, `playwright-cli` | Zero-console-error verification, keyboard/focus audit, 375px–1440px responsive checks, Vitest suite pass, and live browser walkthrough |
