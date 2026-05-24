# CLAUDE.md — Next.js Project Bible

> Drop this file in the root of your project. Claude Code reads it automatically every session.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS Modules for complex components |
| 3D | React Three Fiber + @react-three/drei |
| Scroll Animations | GSAP + ScrollTrigger |
| UI Animations | Framer Motion |
| Package Manager | npm |
| Editor | VS Code |

---

## Project Structure

```
src/
  app/              # App Router — pages, layouts, loading, error files
    api/            # Route handlers (route.ts files)
  components/
    ui/             # Reusable primitives (Button, Card, etc.)
    sections/       # Page sections (Hero, About, etc.)
    three/          # All React Three Fiber components
  hooks/            # Custom React hooks
  lib/              # Utilities, helpers, constants
  types/            # Global TypeScript types (index.d.ts)
  styles/           # globals.css, animations.css
public/
  models/           # .glb / .gltf 3D models
  textures/         # Textures for Three.js
```

---

## Key Commands

```bash
npm run dev          # Start dev server → localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit (no compile, just types)
```

---

## Core Coding Rules

### TypeScript
- Strict mode always — no `any`, ever. Use `unknown` + type narrowing if needed.
- Define prop types ABOVE the component: `interface HeroProps { title: string }`
- Use `type` for unions/primitives, `interface` for object shapes
- Export types from `src/types/index.ts`

### Next.js Conventions
- Server Components by default. Add `'use client'` only when the component needs:
  - `useState` / `useEffect` / hooks
  - Browser APIs (window, document)
  - Event listeners
  - GSAP or Framer Motion animations
- Always use `next/image` — never raw `<img>`
- Always use `next/link` — never raw `<a>` for internal routes
- Use `generateMetadata()` on every page for SEO
- Lazy load heavy components: `const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false })`

### React Patterns
- One component per file, filename matches component name
- Extract logic into hooks: `useScrollProgress`, `useThreeScene`, etc.
- `useCallback` for event handlers passed as props
- `useMemo` for expensive derived values
- `React.forwardRef` when a parent needs a ref to a child DOM element

---

## 3D Scenes (React Three Fiber)

```tsx
// Always lazy load Canvas — never SSR Three.js
const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false })

// Wrap in Suspense with a fallback
<Suspense fallback={<div className="scene-loading" />}>
  <Scene />
</Suspense>
```

### R3F Rules
- All 3D components live in `src/components/three/`
- Use `useFrame` for animation loops — NEVER `setInterval` or `requestAnimationFrame` manually
- Always dispose resources on unmount:
  ```tsx
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [])
  ```
- Prefer `@react-three/drei` helpers: `Environment`, `OrbitControls`, `Text`, `useGLTF`
- Use `useGLTF.preload('/models/model.glb')` at the bottom of the file

### Performance
- Use `instancedMesh` for repeated geometries (particles, grids)
- Avoid creating objects inside `useFrame` — create refs outside
- Use `dpr={[1, 2]}` on `<Canvas>` for responsive pixel ratio
- Keep draw calls under 100 for 60fps on mobile

---

## Scroll Animations (GSAP + ScrollTrigger)

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger) // register once, at module level

export function AnimatedSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.reveal-item', {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
        }
      })
    }, containerRef) // scope to the container ref

    return () => ctx.revert() // ALWAYS clean up — kills all ScrollTriggers in context
  }, [])

  return <div ref={containerRef}> ... </div>
}
```

### GSAP Rules
- Always use `gsap.context()` with a scope ref — it auto-cleans all child tweens
- Always return `ctx.revert()` in the `useEffect` cleanup
- Never call `ScrollTrigger.refresh()` inside render — only in effects, after layout
- Use `pin: true` carefully — it can cause jank if content height isn't stable
- For smooth scrub animations: `scrub: 1` (1 second lag) feels best

---

## Framer Motion

Use for:
- Component mount/unmount animations (`AnimatePresence`)
- Gesture-based interactions (hover, drag, tap)
- Shared layout animations (`layoutId`)

Do NOT use for scroll-based parallax — use GSAP for that.

```tsx
import { motion, AnimatePresence } from 'framer-motion'

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20 }
}
```

---

## Performance Checklist

Before every PR:
- [ ] No `any` types
- [ ] All GSAP ScrollTriggers cleaned up on unmount
- [ ] All R3F geometries/materials disposed on unmount
- [ ] Heavy components dynamically imported with `ssr: false`
- [ ] Images using `next/image` with correct `width`/`height` or `fill`
- [ ] No `console.log` in production code
- [ ] Lighthouse score >90 on mobile

---

## DO NOT

- Edit anything in `node_modules/`
- Use `var` — always `const` or `let`
- Use `any` type — ever
- Use inline styles for static values — always Tailwind or CSS Modules
- Use `!important` in CSS
- Commit `console.log` statements
- Create raw Three.js scenes outside of R3F
- Use `window` or `document` in Server Components

---

## Useful Patterns

### Custom hook for scroll progress
```tsx
import { useScroll, useTransform } from 'framer-motion'

export function useScrollProgress(offset: [string, string] = ['start end', 'end start']) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return { ref, scrollYProgress }
}
```

### Conditional client boundary
```tsx
// Use this pattern to keep a parent as a Server Component
// while one child needs interactivity
<ServerParent>
  <ClientIsland /> {/* 'use client' only in this file */}
</ServerParent>
```
