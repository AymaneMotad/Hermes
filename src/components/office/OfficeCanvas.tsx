'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { usePersonaStore } from '@/store/usePersonaStore';
import { useOfficeFSM } from '@/hooks/useOfficeFSM';
import {
  VIEW_WIDTH,
  VIEW_HEIGHT,
  DESKS,
  PRINTER,
  COFFEE,
} from '@/lib/officeLayout';
import { lumon } from '@/theme/severance';
import type { AgentPhase } from '@/store/usePersonaStore';
import type { Persona } from '@/types/persona';

const COLORS = {
  floor: 0x2d3440,
  wall: 0x3a4351,
  desk: 0x4a5668,
  printer: 0x6b7789,
  coffee: 0x536473,
  accent: 0x95a2b6,
};

const PHASE_CHAT: Record<AgentPhase, string[]> = {
  idle: ['Node ready. Standing by.', 'Worker online and monitoring.'],
  typing: ['Processing queue shard.', 'Running parallel batch.', 'Committing task output.'],
  stand: ['Sync complete. Awaiting next step.', 'Holding station.'],
  walk: ['Routing to service station.', 'Moving to support waypoint.'],
  sit: ['Back at desk. Pipeline resumed.', 'Desk node active again.'],
};

const LOCATION_CHAT = {
  printer: ['Waiting for printer queue...', 'Print job processing.', 'Collecting output and returning.'],
  coffee: ['Coffee break, then back to queue.', 'Quick reset at station.', 'Refueling before next parallel run.'],
};

const PHASE_SCALE: Record<AgentPhase, number> = {
  idle: 1,
  typing: 0.98,
  stand: 1.04,
  walk: 1,
  sit: 0.92,
};

const CHAT_MIN_INTERVAL_MS = 7000;
const CHAT_BY_PHASE_PROBABILITY: Record<AgentPhase, number> = {
  idle: 0.15,
  typing: 0.45,
  stand: 0,
  walk: 0,
  sit: 0.2,
};

const CONVERSATION_COOLDOWN_MS = 9000;
const CONVERSATION_REPLY_DELAY_MS = 850;
const CONVERSATION_TRIGGER_PROBABILITY = 0.5;

const CONVO_STARTERS = [
  'Can you take the next queue partition?',
  'I need support on this active batch.',
  'Can you verify the printer output?',
  'Do you confirm this anomaly signal?',
];

const CONVO_REPLIES = [
  'Confirmed. Processing in parallel.',
  'Acknowledged. Taking this lane.',
  'Copy that. Validating now.',
  'Handled. Sending status update.',
];

type AgentVisual = {
  agent: Container;
  body: Graphics;
  shadow: Graphics;
  bubble: Container;
  bubbleBg: Graphics;
  bubbleTail: Graphics;
  bubbleText: Text;
  targetX: number;
  targetY: number;
  phase: AgentPhase;
  phaseStartMs: number;
  bubbleUntilMs: number;
  lastBubbleAtMs: number;
  walkOffset: number;
  snapToPosition: boolean;
  renderPhase: AgentPhase;
};

type PendingReply = {
  atMs: number;
  targetId: string;
  text: string;
};

function hexToNum(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (n >> 16) * 65536 + ((n >> 8) & 0xff) * 256 + (n & 0xff);
}

export function OfficeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const agentsRef = useRef<Map<string, AgentVisual>>(new Map());
  const selectedIdRef = useRef<string | null>(null);
  const personasByIdRef = useRef<Map<string, Persona>>(new Map());
  const conversationCooldownRef = useRef(0);
  const pendingRepliesRef = useRef<PendingReply[]>([]);
  const personas = usePersonaStore((s) => s.personas);
  const agentPhases = usePersonaStore((s) => s.agentPhases);
  const selectedId = usePersonaStore((s) => s.selectedPersonaId);

  useOfficeFSM(personas);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    personasByIdRef.current = new Map(personas.map((p) => [p.id, p]));
  }, [personas]);

  const drawBackground = useCallback((root: Container) => {
    const floor = new Graphics().rect(0, 0, VIEW_WIDTH, VIEW_HEIGHT).fill(COLORS.floor);
    root.addChild(floor);

    // Subtle pixel-tile pattern so the office reads as a room, not a flat block.
    const floorGrid = new Graphics();
    for (let x = 24; x < VIEW_WIDTH - 24; x += 16) {
      floorGrid.rect(x, 24, 1, VIEW_HEIGHT - 48).fill(0x5b6778, 0.32);
    }
    for (let y = 24; y < VIEW_HEIGHT - 24; y += 16) {
      floorGrid.rect(24, y, VIEW_WIDTH - 48, 1).fill(0x232a34, 0.45);
    }
    root.addChild(floorGrid);

    const walls = new Graphics();
    walls.rect(0, 0, VIEW_WIDTH, 24).fill(COLORS.wall);
    walls.rect(0, 0, 24, VIEW_HEIGHT).fill(COLORS.wall);
    walls.rect(VIEW_WIDTH - 24, 0, 24, VIEW_HEIGHT).fill(COLORS.wall);
    walls.rect(0, VIEW_HEIGHT - 24, VIEW_WIDTH, 24).fill(COLORS.wall);
    walls.rect(0, 22, VIEW_WIDTH, 2).fill(0x566173);
    walls.rect(0, VIEW_HEIGHT - 24, VIEW_WIDTH, 2).fill(0x566173);
    walls.rect(22, 0, 2, VIEW_HEIGHT).fill(0x566173);
    walls.rect(VIEW_WIDTH - 24, 0, 2, VIEW_HEIGHT).fill(0x566173);
    root.addChild(walls);

    const ceilingLights = new Graphics();
    const lightY = 10;
    [120, 250, 380, 510].forEach((x) => {
      ceilingLights.rect(x - 30, lightY, 60, 4).fill(0xb7d4ef, 0.62);
      ceilingLights.rect(x - 26, lightY + 1, 52, 2).fill(0xd8e8f6, 0.78);
    });
    root.addChild(ceilingLights);
  }, []);

  const drawFurniture = useCallback((root: Container) => {
    DESKS.forEach((d) => {
      const desk = new Graphics();
      desk.rect(d.x - 36, d.y - 22, 72, 44).fill(COLORS.desk).stroke({ width: 1, color: COLORS.accent });
      desk.rect(d.x - 36, d.y + 20, 72, 2).fill(0x364153);
      desk.rect(d.x - 34, d.y - 20, 68, 3).fill(0x7f8ca0, 0.45);
      desk.rect(d.x - 32, d.y - 12, 14, 26).fill(0x435066).stroke({ width: 1, color: 0x7f8ca0 });
      desk.rect(d.x - 32, d.y + 1, 14, 1).fill(0x323c4c);
      desk.rect(d.x + 18, d.y - 12, 14, 26).fill(0x435066).stroke({ width: 1, color: 0x7f8ca0 });
      desk.rect(d.x + 18, d.y + 1, 14, 1).fill(0x323c4c);
      root.addChild(desk);

      const monitor = new Graphics();
      monitor.rect(d.x - 18, d.y - 19, 36, 14).fill(0x27303a).stroke({ width: 1, color: 0x141b22 });
      monitor.rect(d.x - 15, d.y - 16, 30, 8).fill(0x79b6c5, 0.95);
      monitor.rect(d.x - 2, d.y - 5, 4, 4).fill(0x4b5764);
      monitor.rect(d.x - 8, d.y - 1, 16, 2).fill(0x5e6d7f);
      root.addChild(monitor);

      const keyboard = new Graphics();
      keyboard.rect(d.x - 14, d.y + 4, 28, 6).fill(0x8c97a8).stroke({ width: 1, color: 0x5a6577 });
      root.addChild(keyboard);

      const chair = new Graphics();
      chair.rect(d.x - 10, d.y + 16, 20, 6).fill(0x69798f);
      chair.rect(d.x - 2, d.y + 22, 4, 8).fill(0x546177);
      chair.rect(d.x - 8, d.y + 30, 16, 2).fill(0x3e495b);
      root.addChild(chair);
    });

    const printer = new Graphics();
    printer.rect(PRINTER.x - 24, PRINTER.y - 20, 48, 38).fill(0x8f9bad).stroke({ width: 1, color: 0x546177 });
    printer.rect(PRINTER.x - 20, PRINTER.y - 14, 40, 8).fill(0x7c899d);
    printer.rect(PRINTER.x - 16, PRINTER.y - 6, 32, 16).fill(0x2f3844);
    printer.rect(PRINTER.x - 10, PRINTER.y + 12, 20, 4).fill(0x6f7b8e);
    printer.rect(PRINTER.x + 14, PRINTER.y - 16, 6, 4).fill(0x556379);
    printer.rect(PRINTER.x + 14, PRINTER.y - 11, 2, 2).fill(0x83d3a0);
    printer.rect(PRINTER.x - 14, PRINTER.y - 23, 28, 4).fill(0xd9e1eb);
    printer.rect(PRINTER.x - 10, PRINTER.y - 27, 20, 4).fill(0xe7edf5, 0.95);
    root.addChild(printer);

    const coffee = new Graphics();
    coffee.rect(COFFEE.x - 22, COFFEE.y - 24, 44, 50).fill(0x6d7787).stroke({ width: 1, color: 0x475466 });
    coffee.rect(COFFEE.x - 16, COFFEE.y - 18, 32, 10).fill(0x2e3742);
    coffee.rect(COFFEE.x - 8, COFFEE.y - 6, 16, 18).fill(COLORS.coffee).stroke({ width: 1, color: 0x405160 });
    coffee.rect(COFFEE.x - 10, COFFEE.y + 14, 20, 4).fill(0x4e5969);
    coffee.rect(COFFEE.x + 10, COFFEE.y - 3, 6, 6).fill(0x96a3b6);
    coffee.rect(COFFEE.x - 26, COFFEE.y + 18, 52, 6).fill(0x5d6778);
    root.addChild(coffee);

    const mugs = new Graphics();
    mugs.rect(COFFEE.x - 14, COFFEE.y + 20, 5, 4).fill(0xc3ccd9).stroke({ width: 1, color: 0x6a7486 });
    mugs.rect(COFFEE.x - 6, COFFEE.y + 20, 5, 4).fill(0xb6c4d3).stroke({ width: 1, color: 0x667486 });
    mugs.rect(COFFEE.x + 2, COFFEE.y + 20, 5, 4).fill(0xcdd6e2).stroke({ width: 1, color: 0x727d90 });
    root.addChild(mugs);
  }, []);

  const renderBubble = useCallback((visual: AgentVisual, text: string, nowMs: number, durationMs = 2200) => {
    visual.bubbleText.text = text;
    const padX = 8;
    const padY = 5;
    const w = visual.bubbleText.width + padX * 2;
    const h = visual.bubbleText.height + padY * 2;

    visual.bubbleBg.clear();
    // Pixel-card popup look with enterprise contrast.
    visual.bubbleBg.rect(-w / 2, -h, w, h).fill(0x2f3a4a, 0.94).stroke({
      width: 1,
      color: 0x8aa0be,
      alpha: 0.9,
    });
    visual.bubbleBg.rect(-w / 2 + 2, -h + 2, w - 4, 2).fill(0x4a5b73, 0.7);

    visual.bubbleTail.clear();
    visual.bubbleTail
      .moveTo(-6, 0)
      .lineTo(0, 8)
      .lineTo(6, 0)
      .closePath()
      .fill(0x2f3a4a, 0.94)
      .stroke({ width: 1, color: 0x8aa0be, alpha: 0.9 });

    visual.bubbleText.position.set(-visual.bubbleText.width / 2, -h + padY);
    visual.bubble.visible = true;
    visual.bubble.alpha = 1;
    visual.bubbleUntilMs = nowMs + durationMs;
    visual.lastBubbleAtMs = nowMs;
  }, []);

  const showAgentBubble = useCallback((visual: AgentVisual, persona: Persona, phase: AgentPhase, nowMs: number) => {
    const elapsedSinceLastBubble = nowMs - visual.lastBubbleAtMs;
    if (elapsedSinceLastBubble < CHAT_MIN_INTERVAL_MS) return;
    if (Math.random() > CHAT_BY_PHASE_PROBABILITY[phase]) return;

    const variants = PHASE_CHAT[phase];
    const phrase = variants[Math.floor(Math.random() * variants.length)];
    renderBubble(visual, `${persona.name}: ${phrase}`, nowMs, 2200);
  }, [renderBubble]);

  const maybeStartConversation = useCallback((speakerId: string, nowMs: number) => {
    if (nowMs < conversationCooldownRef.current) return;
    if (Math.random() > CONVERSATION_TRIGGER_PROBABILITY) return;

    const speakerVisual = agentsRef.current.get(speakerId);
    const speakerPersona = personasByIdRef.current.get(speakerId);
    if (!speakerVisual || !speakerPersona) return;

    const candidates = [...agentsRef.current.entries()]
      .filter(([id]) => id !== speakerId)
      .sort((a, b) => {
        const da = Math.hypot(a[1].agent.x - speakerVisual.agent.x, a[1].agent.y - speakerVisual.agent.y);
        const db = Math.hypot(b[1].agent.x - speakerVisual.agent.x, b[1].agent.y - speakerVisual.agent.y);
        return da - db;
      });
    if (candidates.length === 0) return;

    const topChoices = candidates.slice(0, Math.min(2, candidates.length));
    const [targetId] = topChoices[Math.floor(Math.random() * topChoices.length)];
    const targetPersona = personasByIdRef.current.get(targetId);
    if (!targetPersona) return;

    const startLine = CONVO_STARTERS[Math.floor(Math.random() * CONVO_STARTERS.length)];
    const replyLine = CONVO_REPLIES[Math.floor(Math.random() * CONVO_REPLIES.length)];

    renderBubble(speakerVisual, `${speakerPersona.name}: ${targetPersona.name}, ${startLine}`, nowMs, 2600);
    pendingRepliesRef.current.push({
      atMs: nowMs + CONVERSATION_REPLY_DELAY_MS,
      targetId,
      text: `${targetPersona.name}: ${speakerPersona.name}, ${replyLine}`,
    });

    conversationCooldownRef.current = nowMs + CONVERSATION_COOLDOWN_MS;
  }, [renderBubble]);

  const redrawAgentBody = useCallback((visual: AgentVisual, isSelected: boolean, phase: AgentPhase, timeMs: number) => {
    const body = visual.body;
    const shadow = visual.shadow;
    const baseColor = isSelected ? hexToNum(lumon.fluorescentBlue) : 0x424e4f;

    const elapsed = timeMs - visual.phaseStartMs;
    const walkCycle = (elapsed * 0.018) + visual.walkOffset;
    const typeCycle = elapsed * 0.012;

    let yBob = 0;
    if (phase === 'walk') yBob = Math.sin(walkCycle) * 2;
    if (phase === 'typing') yBob = Math.sin(typeCycle) * 1.2;

    const scaleY = PHASE_SCALE[phase] + (phase === 'walk' ? Math.abs(Math.sin(walkCycle)) * 0.05 : 0);
    const scaleX = 1 + (phase === 'walk' ? Math.abs(Math.sin(walkCycle + Math.PI / 2)) * 0.06 : 0);
    body.scale.set(scaleX, scaleY);
    body.position.set(0, yBob);

    shadow.clear();
    shadow.ellipse(0, 12, 10 + (phase === 'walk' ? 2 : 0), 4).fill(0x25282a, 0.2);

    body.clear();
    if (phase === 'sit') {
      body.roundRect(-12, -10, 24, 18, 7).fill(baseColor);
    } else {
      body.circle(0, 0, 13).fill(baseColor);
    }

    body.circle(4, -2, 3).fill(0xe8eaec);

    if (phase === 'typing') {
      const armY = Math.sin(typeCycle) * 1.5;
      body.rect(7, 1 + armY, 6, 3).fill(hexToNum(lumon.refinerGreen));
      body.rect(-13, 1 - armY, 5, 3).fill(hexToNum(lumon.refinerGreen));
    }

    if (phase === 'walk') {
      const legOffset = Math.sin(walkCycle) * 2;
      body.roundRect(-6, 9 + legOffset, 5, 6, 2).fill(0x2f3738);
      body.roundRect(1, 9 - legOffset, 5, 6, 2).fill(0x2f3738);
    }

    // Keep stand distinct with posture only, without bright floor-like flash accents.
  }, []);

  const getLocationContext = useCallback((position: [number, number]): 'printer' | 'coffee' | 'desk' | null => {
    const [x, y] = position;
    const distPrinter = Math.hypot(x - PRINTER.x, y - PRINTER.y);
    const distCoffee = Math.hypot(x - COFFEE.x, y - COFFEE.y);
    if (distPrinter < 12) return 'printer';
    if (distCoffee < 12) return 'coffee';
    const isDesk = DESKS.some((d) => Math.hypot(x - d.x, y - d.y) < 12);
    if (isDesk) return 'desk';
    return null;
  }, []);

  const getDisplayPhase = useCallback((personaPosition: [number, number], phase: AgentPhase): AgentPhase => {
    if (phase !== 'walk') return phase;
    const [x, y] = personaPosition;
    const nearPrinter = Math.hypot(x - PRINTER.x, y - PRINTER.y) < 30;
    const nearCoffee = Math.hypot(x - COFFEE.x, y - COFFEE.y) < 30;
    if (nearPrinter || nearCoffee) return 'stand';
    return phase;
  }, []);

  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    let app: Application | null = null;
    const agentsMap = agentsRef.current;

    (async () => {
      app = new Application();
      await app.init({
        width: VIEW_WIDTH,
        height: VIEW_HEIGHT,
        background: COLORS.floor,
        antialias: true,
      });

      if (containerRef.current) containerRef.current.appendChild(app.canvas);

      const root = new Container();
      const backgroundLayer = new Container();
      const furnitureLayer = new Container();
      const agentsLayer = new Container();

      root.addChild(backgroundLayer);
      root.addChild(furnitureLayer);
      root.addChild(agentsLayer);

      drawBackground(backgroundLayer);
      drawFurniture(furnitureLayer);
      furnitureLayer.sortableChildren = true;
      agentsLayer.sortableChildren = true;

      const opsPanel = new Graphics();
      const opsBars = new Graphics();
      opsPanel.rect(VIEW_WIDTH - 180, 32, 156, 34).fill(0x1f2732, 0.9).stroke({
        width: 1,
        color: 0x7e93af,
        alpha: 0.85,
      });
      opsPanel.rect(VIEW_WIDTH - 176, 36, 148, 2).fill(0x314054, 0.85);
      backgroundLayer.addChild(opsPanel);
      backgroundLayer.addChild(opsBars);

      app.stage.addChild(root);
      appRef.current = app;

      const chatStyle = new TextStyle({
        fill: 0xe6edf6,
        fontSize: 11,
        fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
      });
      const hudStyle = new TextStyle({
        fill: 0xaec2dd,
        fontSize: 9,
        fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
      });
      const opsLabel = new Text({ text: 'PARALLEL AGENTS', style: hudStyle });
      opsLabel.position.set(VIEW_WIDTH - 172, 42);
      backgroundLayer.addChild(opsLabel);

      const { personas: initialPersonas, agentPhases: initialPhases } = usePersonaStore.getState();
      initialPersonas.forEach((p) => {
        const agent = new Container();
        agent.eventMode = 'static';
        agent.cursor = 'pointer';
        agent.sortableChildren = true;
        agent.zIndex = p.position[1];

        const shadow = new Graphics();
        shadow.zIndex = 0;
        agent.addChild(shadow);

        const body = new Graphics();
        body.zIndex = 1;
        agent.addChild(body);

        const bubble = new Container();
        bubble.visible = false;
        bubble.position.set(0, -22);
        bubble.zIndex = 2;
        const bubbleBg = new Graphics();
        const bubbleTail = new Graphics();
        bubbleTail.position.set(0, 0);
        const bubbleText = new Text({ text: '', style: chatStyle });
        bubble.addChild(bubbleBg);
        bubble.addChild(bubbleTail);
        bubble.addChild(bubbleText);
        agent.addChild(bubble);

        agent.position.set(p.position[0], p.position[1]);
        const phase = initialPhases[p.id] ?? 'typing';
        const visual: AgentVisual = {
          agent,
          body,
          shadow,
          bubble,
          bubbleBg,
          bubbleTail,
          bubbleText,
          targetX: p.position[0],
          targetY: p.position[1],
          phase,
          phaseStartMs: performance.now(),
          bubbleUntilMs: 0,
          lastBubbleAtMs: 0,
          walkOffset: Math.random() * Math.PI * 2,
          snapToPosition: false,
          renderPhase: phase,
        };
        redrawAgentBody(visual, selectedIdRef.current === p.id, phase, performance.now());
        agentsLayer.addChild(agent);
        agentsMap.set(p.id, visual);

        agent.on('pointerdown', () => {
          usePersonaStore.getState().selectPersona(
            usePersonaStore.getState().selectedPersonaId === p.id ? null : p.id
          );
        });

        visual.lastBubbleAtMs = performance.now();
      });

      app.ticker.add(() => {
        const now = performance.now();
        const phases = usePersonaStore.getState().agentPhases;
        const activeCount = Object.values(phases).filter((phase) => phase === 'typing' || phase === 'walk').length;
        const totalAgents = Math.max(agentsMap.size, 1);
        const loadRatio = Math.min(1, activeCount / totalAgents);
        opsBars.clear();
        opsBars.rect(VIEW_WIDTH - 172, 54, 140, 6).fill(0x2c3745, 0.95);
        opsBars.rect(VIEW_WIDTH - 172, 54, 140 * loadRatio, 6).fill(0x76b9d3, 0.9);
        const pulseX = VIEW_WIDTH - 172 + 140 * loadRatio;
        opsBars.rect(Math.max(VIEW_WIDTH - 172, pulseX - 1), 53, 2, 8).fill(0xc4e7ff, 0.9);

        if (pendingRepliesRef.current.length > 0) {
          const queued = pendingRepliesRef.current;
          const remaining: PendingReply[] = [];
          queued.forEach((item) => {
            if (item.atMs <= now) {
              const targetVisual = agentsMap.get(item.targetId);
              if (targetVisual) renderBubble(targetVisual, item.text, now, 2400);
            } else {
              remaining.push(item);
            }
          });
          pendingRepliesRef.current = remaining;
        }

        agentsMap.forEach((visual, id) => {
          if (visual.snapToPosition) {
            visual.agent.x = visual.targetX;
            visual.agent.y = visual.targetY;
          } else {
            const dx = visual.targetX - visual.agent.x;
            const dy = visual.targetY - visual.agent.y;
            visual.agent.x += dx * 0.24;
            visual.agent.y += dy * 0.24;
          }
          visual.agent.zIndex = visual.agent.y;

          if (visual.bubble.visible) {
            const remaining = visual.bubbleUntilMs - now;
            if (remaining <= 0) {
              visual.bubble.alpha = Math.max(0, visual.bubble.alpha - 0.08);
              if (visual.bubble.alpha <= 0.02) visual.bubble.visible = false;
            } else if (remaining < 300) {
              visual.bubble.alpha = remaining / 300;
            }
          }

          const phase = visual.renderPhase;
          const isSelected = selectedIdRef.current === id;
          redrawAgentBody(visual, Boolean(isSelected), phase, now);
        });
      });
    })();

    return () => {
      app?.destroy(true);
      appRef.current = null;
      agentsMap.clear();
      pendingRepliesRef.current = [];
    };
  }, [drawBackground, drawFurniture, redrawAgentBody, renderBubble]);

  useEffect(() => {
    const nowMs = performance.now();
    personas.forEach((p) => {
      const visual = agentsRef.current.get(p.id);
      if (!visual) return;
      visual.targetX = p.position[0];
      visual.targetY = p.position[1];
      const phase = agentPhases[p.id] ?? 'typing';
      const location = getLocationContext(p.position);
      visual.snapToPosition =
        (phase === 'walk' || phase === 'stand') &&
        (location === 'printer' || location === 'coffee');
      const displayPhase = getDisplayPhase(p.position, phase);
      visual.renderPhase = displayPhase;
      if (visual.phase !== phase) {
        visual.phase = phase;
        visual.phaseStartMs = nowMs;
        if (phase === 'stand' && (location === 'printer' || location === 'coffee')) {
          const lines = LOCATION_CHAT[location];
          const line = lines[Math.floor(Math.random() * lines.length)];
          renderBubble(visual, `${p.name}: ${line}`, nowMs, 2300);
        } else {
          showAgentBubble(visual, p, phase, nowMs);
        }
        if ((phase === 'typing' || phase === 'sit' || phase === 'idle') && location === 'desk') {
          maybeStartConversation(p.id, nowMs);
        }
      }
      redrawAgentBody(visual, selectedId === p.id, displayPhase, nowMs);
    });
  }, [personas, agentPhases, selectedId, redrawAgentBody, renderBubble, showAgentBubble, maybeStartConversation, getLocationContext, getDisplayPhase]);

  return <div ref={containerRef} className="h-full w-full" style={{ minHeight: VIEW_HEIGHT }} />;
}
