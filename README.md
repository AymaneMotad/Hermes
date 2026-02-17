# Hermes Q — Persona Operations Platform

A cinematic, realistic 3D web application inspired by the aesthetic of *Severance*. The platform visualizes AI personas (agents) as digital office workers inside a minimalist corporate environment.

## Tech Stack

- **Next.js** (App Router)
- **React Three Fiber** + **Three.js** + **@react-three/drei**
- **Zustand** (state)
- **GSAP** (UI transitions)
- **WebSockets** (optional, for live persona state)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The 3D office loads with four personas. Click a persona in the sidebar or in the scene to focus the camera and open the task panel.

### Node Version

- Next.js 16 requires **Node.js >= 20.9.0**. If your current Node is older, use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) and run `nvm use 20` or `fnm use 20` before `npm run build`.

## Features

- **3D office**: White walls, matte floor, soft shadows, fog, overhead and window lighting, glass meeting room, desks and chairs.
- **Personas**: Four AI operators (OpenClaw, Sentinel, Scribe, Nexus) with three states:
  - **Idle** — standing, subtle breathing, head movement.
  - **Working** — typing pose, arms at desk.
  - **Alert** — red pulse and status ring, desk glow.
- **Real-time state**: Without a WebSocket URL, the app runs a **mock** that cycles persona statuses every ~8s. To drive state from your backend, use the WebSocket hook (see below).
- **UI**: Sidebar (persona list + status), task detail panel (status, role, current task, notice), minimal typography, neutral palette.
- **Camera**: Isometric-style view, smooth pan, click-to-focus on persona, subtle idle drift.

## WebSocket Integration

Persona state can be driven by a WebSocket server. Message format:

```json
{
  "type": "persona_state",
  "id": "openclaw",
  "status": "working",
  "currentTask": "Research in progress",
  "errorMessage": null
}
```

- `id`: persona id (`openclaw`, `sentinel`, `scribe`, `nexus`).
- `status`: `"idle"` | `"working"` | `"alert"`.
- `currentTask`, `errorMessage`: optional.

In your app, pass the WebSocket URL to the hook:

```tsx
usePersonaWebSocket('ws://localhost:4000');
```

Without a URL, the mock runs and no connection is made.

## Project Structure

```
src/
├── app/              # Next.js App Router (layout, page)
├── components/
│   ├── scene/        # R3F: Office, Lighting, Persona, CameraRig, Scene
│   └── ui/           # Sidebar, TaskPanel, StatusBadge
├── store/            # Zustand (personas, selection)
├── hooks/            # usePersonaWebSocket
└── types/            # Persona, PersonaStatus, etc.
```

## Extending

The layout is built so you can:

- Add more rooms and desks (see `Office.tsx` and `DESKS`).
- Add more personas in `usePersonaStore` and give them positions/deskIds.
- Plug in real GLB models and animations (e.g. Mixamo) in `Persona.tsx` by loading a `<useGLTF>` and switching clips by `status`.
- Add task pipelines, multi-floor buildings, or analytics overlays by extending the store and scene.

## License

MIT
