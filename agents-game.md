# Office & Agents Architecture

Documentation for the PixiJS office simulation: agents moving between desks, printer, and coffee. Use this as a reference when making changes.

---

## Overview

The **Live Floor Simulator** shows 4 agents (personas) in a 2D top-down office. Each agent:

1. Sits at their desk and "types" for 3–10 seconds
2. Stands, then walks to **printer** or **coffee** (alternating)
3. Stands at the service station for 600ms
4. Walks back to their desk
5. Sits briefly, then returns to typing — **loop repeats**

Agents run in **parallel**; their FSMs are independent.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           OfficeCanvas (PixiJS)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐ │
│  │  background  │  │  furniture   │  │  agents layer (4 AgentVisual)   │ │
│  │  floor, walls│  │  desks,      │  │  body, shadow, chat bubble       │ │
│  │  ceiling     │  │  printer,    │  │  lerp toward store position     │ │
│  │              │  │  coffee      │  │  phase-based body redraw        │ │
│  └──────────────┘  └──────────────┘  └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      usePersonaStore (Zustand)                           │
│  personas: Persona[]     agentPhases: Record<id, AgentPhase>             │
│  setPersonaPosition()   setAgentPhase()                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │ writes position + phase
                                 │
┌─────────────────────────────────────────────────────────────────────────┐
│                      useOfficeFSM (hook)                                 │
│  setInterval(120ms) → for each persona: advance FSM                       │
│  stateRef: Map<id, InternalState>  (phase, targetX/Y, phaseEndTime, ...) │
│  Reads: personasRef (synced from React personas each render)            │
│  Writes: setPosition, setPhase                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

1. **FSM** (`useOfficeFSM`) runs every 120ms. It uses `performance.now()` for absolute timestamps and `deltaMs` for frame-rate independent movement. For each agent, it updates `phase` and `position` in the store via `setAgentPhase` and `setPersonaPosition`.

2. **OfficeCanvas** subscribes to `personas` and `agentPhases`. When they change, it syncs `targetX/Y`, `snapToPosition`, and `renderPhase` to each `AgentVisual`.

3. **PixiJS ticker** runs every frame. Each agent’s sprite is moved toward `targetX/Y` (lerp 0.24). The body is redrawn based on `renderPhase`.

4. **Position source of truth** is the store. FSM updates it; canvas only renders it.

---

## Key Files

| File | Responsibility |
|------|----------------|
| `src/lib/officeLayout.ts` | Layout: viewport size, desk/printer/coffee positions, helpers |
| `src/store/usePersonaStore.ts` | Personas data, positions, phases, selection |
| `src/hooks/useOfficeFSM.ts` | Agent FSM (desk → service → desk loop) |
| `src/components/office/OfficeCanvas.tsx` | PixiJS canvas, drawing, chat bubbles, visual sync |
| `src/types/persona.ts` | Persona shape, AgentPhase, roles, behavior |

---

## Office Layout

- **Viewport**: 640×400 px (top-down).
- **Desks**: 4 desks at fixed positions. Each persona has a `deskId` and starts there.
- **Printer**: (460, 100)
- **Coffee**: (460, 280)

Positions are in world pixels. To add desks or move services, edit `officeLayout.ts` and ensure `getDeskPosition` / `getWaypoint` stay in sync.

---

## Agent FSM (Finite State Machine)

Each agent has an **internal state** held in `stateRef` inside `useOfficeFSM`:

| Field | Purpose |
|-------|---------|
| `phase` | Current FSM phase |
| `targetX`, `targetY` | Walk destination |
| `phaseEndTime` | Timestamp when phase ends |
| `destinationMode` | `'service'` (going to printer/coffee) or `'desk'` |
| `nextService` | Next service: `'printer'` or `'coffee'` |

### Phase Flow

```
typing ──(time up)──► stand ──(600ms)──► walk ──(arrive)──► stand (at service)
   ▲                                                              │
   │                                                              │ (600ms)
   │                                                              ▼
   └──────── sit ────(200ms)─── walk ────(arrive at desk)─────────┘
```

### Phase Logic

| Phase | Behavior |
|-------|----------|
| **typing** | Stay until `phaseEndTime` (3–10s random), then → stand |
| **stand** | Stay 600ms, then → walk. Target is printer/coffee if `destinationMode === 'service'`, desk if `destinationMode === 'desk'` |
| **walk** | Move toward `targetX/Y`. On arrival: if at printer/coffee → stand; if at desk → sit |
| **sit** | 200ms, then → typing |

### Service Alternation

- After printer → next service is coffee
- After coffee → next service is printer

### Timing Constants (in `useOfficeFSM.ts`)

- `TICK_MS`: 120
- `WALK_SPEED`: 2.2
- `SIT_TYPING_MIN_MS` / `SIT_TYPING_MAX_MS`: 3000–10000
- `STAND_DURATION_MS`: 600
- `ARRIVAL_DIST`: 6 px (considered “arrived”)

---

## Visual Layer (OfficeCanvas)

### AgentVisual

Each agent is rendered as:

- **Container**: holds body, shadow, bubble
- **Graphics (body)**: circle or rounded rect, arms/legs driven by phase and time
- **Graphics (shadow)**: ellipse under the agent
- **Chat bubble**: text + background, shown by phase/location

### Phases → Visuals

| Phase | Body | Notes |
|-------|------|-------|
| typing | Sitting pose, arms move (typing) | Scale 0.98 |
| stand | Standing circle | Scale 1.04 |
| walk | Circle, legs animate | Scale 1, walk cycle |
| sit | Rounded rect (seated) | Scale 0.92 |

### renderPhase vs phase

- **phase**: FSM state from the store (idle, typing, stand, walk, sit).
- **renderPhase**: Used for drawing. At printer/coffee during walk, `renderPhase` is overridden to `stand` so they don’t loop visually.

### Position Sync

- **Store position** is the FSM target; PixiJS position lerps toward it.
- At printer/coffee, `snapToPosition` is true so the agent snaps to the station.
- Lerp factor: `0.24` per frame.

---

## Chat Bubbles

- **Phase-based**: Random message per phase (`PHASE_CHAT`).
- **Location-based**: At printer/coffee, specific messages from `LOCATION_CHAT`.
- **Conversations**: Agents at desks can start a conversation with a nearby agent; a reply is scheduled and shown after ~850ms.
- Throttled by `CHAT_MIN_INTERVAL_MS` (7s) and phase-specific probabilities.

---

## Making Changes

### Add a new desk or service station

1. Update `officeLayout.ts`: add to `DESKS` or define new waypoint.
2. If adding personas, add entries in `usePersonaStore` `initialPersonas` with matching `deskId`.
3. In `useOfficeFSM`, extend `nextService` and `getWaypoint` if you add new services.

### Change agent speed or timing

Edit constants in `useOfficeFSM.ts`:

- `WALK_SPEED` – movement speed
- `SIT_TYPING_MIN_MS` / `SIT_TYPING_MAX_MS` – typing duration
- `STAND_DURATION_MS` – wait at printer/coffee
- `ARRIVAL_DIST` – arrival radius

### Change visual style

Edit `OfficeCanvas.tsx`:

- `COLORS` – palette
- `redrawAgentBody` – body shape and animations
- `PHASE_SCALE` – scale per phase

### Change chat messages

Edit in `OfficeCanvas.tsx`:

- `PHASE_CHAT` – phase messages
- `LOCATION_CHAT` – printer/coffee messages
- `CONVO_STARTERS` / `CONVO_REPLIES` – conversation lines

### Fix agents getting stuck

FSM uses `personasRef` (kept in sync with store) so positions stay fresh. Movement uses `deltaMs` for frame-rate independent speed. If agents get stuck:

1. Check `ARRIVAL_DIST` (6px); may need to increase.
2. Ensure `phaseEndTime` is advancing (`t` from `performance.now()`).
3. Verify `destinationMode` and `nextService` are set correctly at printer/coffee.

---

## Tech Stack

- **Next.js 16**, **React 19**, **TypeScript 5**
- **PixiJS 8** – 2D canvas
- **Zustand 5** – store (personas, phases)
- **Tailwind 4** – page styling
