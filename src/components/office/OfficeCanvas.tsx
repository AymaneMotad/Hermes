'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Application, BlurFilter, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { usePersonaStore } from '@/store/usePersonaStore';
import { useOfficeFSM } from '@/hooks/useOfficeFSM';
import {
  VIEW_WIDTH,
  VIEW_HEIGHT,
  DESKS,
  PRINTER,
  COFFEE,
} from '@/lib/officeLayout';
import type { AgentPhase } from '@/store/usePersonaStore';
import type { Persona } from '@/types/persona';

const COLORS = {
  wall: 0xf0f2f4,
  floor: 0xcfd8d1,
  desk: 0xf2f4f6,
  monitor: 0x1f2937,
  printer: 0xd2d9de,
  coffee: 0xd2d9de,
  accent: 0xaeb7be,
};

const GLOW = {
  blue: 0x3b82f6,
  cyan: 0x22d3ee,
  violet: 0x8b5cf6,
};

const PHASE_CHAT: Record<AgentPhase, string[]> = {
  idle: [
    'Node ready. Standing by.',
    'Worker online and monitoring.',
    'Awaiting mission fragment.',
    'Telemetry stable and synced.',
  ],
  typing: [
    'Processing queue shard.',
    'Running parallel batch.',
    'Committing task output.',
    'Evaluating confidence signal.',
    'Cross-checking policy constraints.',
  ],
  stand: [
    'Sync complete. Awaiting next step.',
    'Holding station.',
    'Lane handoff in progress.',
    'Quick coordination pause.',
  ],
  walk: [
    'Routing to service station.',
    'Moving to support waypoint.',
    'Repositioning for next cycle.',
    'Transferring work context.',
  ],
  sit: [
    'Back at desk. Pipeline resumed.',
    'Desk node active again.',
    'Resuming local execution lane.',
    'Cycle complete, continuing.',
  ],
};

const LOCATION_CHAT = {
  printer: ['Waiting for printer queue...', 'Print job processing.', 'Collecting output and returning.'],
  coffee: ['Coffee break, then back to queue.', 'Quick reset at station.', 'Refueling before next parallel run.'],
};

const PHASE_SCALE: Record<AgentPhase, number> = {
  idle: 1,
  typing: 0.985,
  stand: 1.01,
  walk: 1,
  sit: 0.96,
};

const CHAT_MIN_INTERVAL_MS = 2600;
const CHAT_BY_PHASE_PROBABILITY: Record<AgentPhase, number> = {
  idle: 0.35,
  typing: 0.72,
  stand: 0.55,
  walk: 0.42,
  sit: 0.45,
};

const CONVERSATION_COOLDOWN_MS = 2800;
const CONVERSATION_REPLY_DELAY_MS = 500;
const CONVERSATION_TRIGGER_PROBABILITY = 0.82;
const AMBIENT_CHAT_INTERVAL_MS = 1600;

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

const AMBIENT_CHAT = [
  'Desk cluster synchronized.',
  'Service lane active.',
  'Confidence trend improving.',
  'Escalation queue clear.',
  'Printer lane stable.',
  'Coffee node refueled.',
];

type AgentVisual = {
  agent: Container;
  body: Graphics;
  shadow: Graphics;
  isCoordinator: boolean;
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

export function OfficeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const agentsRef = useRef<Map<string, AgentVisual>>(new Map());
  const selectedIdRef = useRef<string | null>(null);
  const personasByIdRef = useRef<Map<string, Persona>>(new Map());
  const conversationCooldownRef = useRef(0);
  const ambientChatAtRef = useRef(0);
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

    // Light matte paneling to avoid flat vector look.
    const floorGrid = new Graphics();
    for (let x = 24; x < VIEW_WIDTH - 24; x += 16) {
      floorGrid.rect(x, 24, 1, VIEW_HEIGHT - 48).fill(0xc7cfd8, 0.26);
    }
    for (let y = 24; y < VIEW_HEIGHT - 24; y += 16) {
      floorGrid.rect(24, y, VIEW_WIDTH - 48, 1).fill(0xb9c3ce, 0.22);
    }
    root.addChild(floorGrid);

    const zoneTint = new Graphics();
    // Open workspace cluster.
    zoneTint.roundRect(80, 88, 420, 312, 18).fill(0xdde3de, 0.55);
    // Meeting bay.
    zoneTint.roundRect(515, 220, 170, 150, 14).fill(0xe3e7ec, 0.52);
    // Coordinator private office.
    zoneTint.roundRect(675, 60, 230, 140, 14).fill(0xe2e7eb, 0.6);
    // Service zone.
    zoneTint.roundRect(690, 245, 190, 220, 14).fill(0xdce3e8, 0.5);
    root.addChild(zoneTint);

    const officeGlass = new Graphics();
    officeGlass.roundRect(675, 60, 230, 140, 14).stroke({ width: 2, color: 0x94a3b8, alpha: 0.55 });
    officeGlass.roundRect(684, 70, 212, 116, 10).fill(0xeaf0f6, 0.18);
    officeGlass.rect(788, 60, 28, 12).fill(0x9aa7ba, 0.55); // door header
    officeGlass.filters = [new BlurFilter(0.6)];
    root.addChild(officeGlass);

    const walls = new Graphics();
    walls.rect(0, 0, VIEW_WIDTH, 24).fill(COLORS.wall);
    walls.rect(0, 0, 24, VIEW_HEIGHT).fill(COLORS.wall);
    walls.rect(VIEW_WIDTH - 24, 0, 24, VIEW_HEIGHT).fill(COLORS.wall);
    walls.rect(0, VIEW_HEIGHT - 24, VIEW_WIDTH, 24).fill(COLORS.wall);
    walls.rect(0, 22, VIEW_WIDTH, 2).fill(0xc1cad5);
    walls.rect(0, VIEW_HEIGHT - 24, VIEW_WIDTH, 2).fill(0xc1cad5);
    walls.rect(22, 0, 2, VIEW_HEIGHT).fill(0xc1cad5);
    walls.rect(VIEW_WIDTH - 24, 0, 2, VIEW_HEIGHT).fill(0xc1cad5);
    root.addChild(walls);

    // Thin futuristic ceiling lines with controlled glow.
    const ceilingLights = new Graphics();
    const lightY = 10;
    [90, 220, 350, 480, 610, 740, 870].forEach((x) => {
      ceilingLights.rect(x - 34, lightY, 68, 2).fill(0xf3f6fb, 0.9);
      ceilingLights.rect(x - 30, lightY + 2, 60, 1).fill(0xe9eff8, 0.8);
    });
    root.addChild(ceilingLights);

    const ceilingGlow = new Graphics();
    [90, 220, 350, 480, 610, 740, 870].forEach((x, idx) => {
      const color = idx % 3 === 0 ? GLOW.blue : idx % 3 === 1 ? GLOW.cyan : GLOW.violet;
      ceilingGlow.rect(x - 32, lightY - 1, 64, 4).fill(color, 0.1);
    });
    ceilingGlow.filters = [new BlurFilter(6)];
    ceilingGlow.blendMode = 'add';
    root.addChild(ceilingGlow);

    // Subtle vignette on edges.
    const vignette = new Graphics();
    for (let i = 0; i < 6; i++) {
      const inset = i * 8;
      vignette
        .rect(inset, inset, VIEW_WIDTH - inset * 2, VIEW_HEIGHT - inset * 2)
        .stroke({ width: 12, color: 0x738091, alpha: 0.03 + i * 0.01 });
    }
    root.addChild(vignette);

    const labels = new TextStyle({
      fill: 0x7a8799,
      fontSize: 10,
      fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
      fontWeight: '600',
    });
    const operationsLabel = new Text({ text: 'SEVERANCE FLOOR - EXECUTION LANES', style: labels });
    operationsLabel.position.set(36, 34);
    root.addChild(operationsLabel);
    const coordinatorLabel = new Text({ text: 'COORDINATOR OFFICE', style: labels });
    coordinatorLabel.position.set(716, 46);
    root.addChild(coordinatorLabel);
    const printerLabel = new Text({ text: 'SERVICE / PRINTER', style: labels });
    printerLabel.position.set(PRINTER.x - 62, PRINTER.y - 44);
    root.addChild(printerLabel);
    const coffeeLabel = new Text({ text: 'SERVICE / COFFEE', style: labels });
    coffeeLabel.position.set(COFFEE.x - 60, COFFEE.y - 44);
    root.addChild(coffeeLabel);
  }, []);

  const drawFurniture = useCallback((root: Container) => {
    DESKS.forEach((d) => {
      const isCoordinatorDesk = d.id === 'desk-1';
      const deskShadow = new Graphics();
      deskShadow.ellipse(d.x, d.y + 22, isCoordinatorDesk ? 46 : 36, isCoordinatorDesk ? 14 : 12).fill(0x5f6a78, 0.16);
      root.addChild(deskShadow);

      const desk = new Graphics();
      const deskW = isCoordinatorDesk ? 94 : 72;
      const deskH = isCoordinatorDesk ? 52 : 44;
      desk.roundRect(d.x - deskW / 2, d.y - 22, deskW, deskH, 8).fill(COLORS.desk).stroke({ width: 1, color: COLORS.accent, alpha: 0.8 });
      desk.roundRect(d.x - deskW / 2 + 2, d.y - 20, deskW - 4, 5, 3).fill(0xffffff, 0.45);
      desk.roundRect(d.x - deskW / 2 + 4, d.y - 10, 14, 24, 3).fill(0xe8edf1).stroke({ width: 1, color: 0xc7d0dc, alpha: 0.9 });
      desk.roundRect(d.x + deskW / 2 - 18, d.y - 10, 14, 24, 3).fill(0xe8edf1).stroke({ width: 1, color: 0xc7d0dc, alpha: 0.9 });
      root.addChild(desk);

      const monitor = new Graphics();
      const monitorW = isCoordinatorDesk ? 46 : 36;
      const monitorX = d.x - monitorW / 2;
      monitor.roundRect(monitorX, d.y - 19, monitorW, 14, 3).fill(COLORS.monitor).stroke({ width: 1, color: 0x374151 });
      monitor.roundRect(monitorX + 3, d.y - 16, monitorW - 6, 8, 2).fill(0x111827);
      monitor.rect(d.x - 2, d.y - 5, 4, 4).fill(0x4b5563);
      monitor.roundRect(d.x - 10, d.y - 1, 20, 2, 1).fill(0x6b7280);
      root.addChild(monitor);

      const monitorGlow = new Graphics();
      monitorGlow.roundRect(monitorX + 2, d.y - 17, monitorW - 4, 10, 2).stroke({ width: 1, color: isCoordinatorDesk ? GLOW.violet : GLOW.cyan, alpha: 0.3 });
      monitorGlow.roundRect(d.x - deskW / 2, d.y + 20, deskW, 2, 1).fill(GLOW.blue, 0.15);
      monitorGlow.filters = [new BlurFilter(3)];
      monitorGlow.blendMode = 'add';
      root.addChild(monitorGlow);

      const keyboard = new Graphics();
      keyboard.roundRect(d.x - 14, d.y + 4, 28, 6, 2).fill(0xdbe2ea).stroke({ width: 1, color: 0xb8c2ce });
      root.addChild(keyboard);

      const chair = new Graphics();
      chair.roundRect(d.x - 10, d.y + 16, 20, 6, 3).fill(isCoordinatorDesk ? 0xbfc9d7 : 0xc9d2de);
      chair.rect(d.x - 2, d.y + 22, 4, 8).fill(0xb5bfcc);
      chair.roundRect(d.x - 8, d.y + 30, 16, 2, 1).fill(0x9ca8b7);
      root.addChild(chair);
    });

    const printer = new Graphics();
    printer.roundRect(PRINTER.x - 24, PRINTER.y - 20, 48, 38, 7).fill(COLORS.printer).stroke({ width: 1, color: 0xb7c1ce });
    printer.roundRect(PRINTER.x - 20, PRINTER.y - 14, 40, 8, 2).fill(0xc5ced9);
    printer.roundRect(PRINTER.x - 16, PRINTER.y - 6, 32, 16, 2).fill(0x374151);
    printer.roundRect(PRINTER.x - 10, PRINTER.y + 12, 20, 4, 1).fill(0xb6c0cd);
    printer.roundRect(PRINTER.x + 14, PRINTER.y - 16, 6, 4, 1).fill(0x9da8b7);
    printer.roundRect(PRINTER.x - 14, PRINTER.y - 23, 28, 4, 1).fill(0xf5f7fb);
    printer.roundRect(PRINTER.x - 10, PRINTER.y - 27, 20, 4, 1).fill(0xffffff, 0.96);
    root.addChild(printer);

    const printerGlow = new Graphics();
    printerGlow.circle(PRINTER.x + 15, PRINTER.y - 10, 2).fill(GLOW.cyan, 0.75);
    printerGlow.circle(PRINTER.x + 15, PRINTER.y - 10, 5).fill(GLOW.cyan, 0.25);
    printerGlow.filters = [new BlurFilter(4)];
    printerGlow.blendMode = 'add';
    root.addChild(printerGlow);

    const coffee = new Graphics();
    coffee.roundRect(COFFEE.x - 22, COFFEE.y - 24, 44, 50, 7).fill(COLORS.coffee).stroke({ width: 1, color: 0xb7c1ce });
    coffee.roundRect(COFFEE.x - 16, COFFEE.y - 18, 32, 10, 2).fill(0xc5ced9);
    coffee.roundRect(COFFEE.x - 8, COFFEE.y - 6, 16, 18, 2).fill(0x4b5563).stroke({ width: 1, color: 0x6b7280 });
    coffee.roundRect(COFFEE.x - 10, COFFEE.y + 14, 20, 4, 1).fill(0xb6c0cd);
    coffee.roundRect(COFFEE.x + 10, COFFEE.y - 3, 6, 6, 2).fill(0x9da8b7);
    coffee.roundRect(COFFEE.x - 26, COFFEE.y + 18, 52, 6, 2).fill(0xc0c8d4);
    root.addChild(coffee);

    const coffeeGlow = new Graphics();
    coffeeGlow.roundRect(COFFEE.x - 7, COFFEE.y - 4, 14, 4, 2).fill(GLOW.violet, 0.28);
    coffeeGlow.filters = [new BlurFilter(4)];
    coffeeGlow.blendMode = 'add';
    root.addChild(coffeeGlow);

    const mugs = new Graphics();
    mugs.roundRect(COFFEE.x - 14, COFFEE.y + 20, 5, 4, 1).fill(0xf3f5f8).stroke({ width: 1, color: 0xb0bac8 });
    mugs.roundRect(COFFEE.x - 6, COFFEE.y + 20, 5, 4, 1).fill(0xebeff5).stroke({ width: 1, color: 0xb0bac8 });
    mugs.roundRect(COFFEE.x + 2, COFFEE.y + 20, 5, 4, 1).fill(0xf8fafc).stroke({ width: 1, color: 0xb0bac8 });
    root.addChild(mugs);

    const meetingTable = new Graphics();
    meetingTable.roundRect(522, 254, 156, 78, 14).fill(0xebeff3).stroke({ width: 1, color: 0xbec8d3 });
    meetingTable.roundRect(530, 262, 140, 62, 10).fill(0xdfe5eb, 0.78);
    root.addChild(meetingTable);

    const meetingChairs = new Graphics();
    const topXs = [534, 572, 610, 648];
    topXs.forEach((x) => {
      // top chairs
      meetingChairs.roundRect(x, 236, 20, 8, 3).fill(0xc8d1dd); // back
      meetingChairs.roundRect(x + 1, 244, 18, 9, 3).fill(0xd6dde7); // seat
      // bottom chairs
      meetingChairs.roundRect(x, 333, 20, 8, 3).fill(0xc8d1dd); // back
      meetingChairs.roundRect(x + 1, 324, 18, 9, 3).fill(0xd6dde7); // seat
    });
    // left / right side chairs
    [273, 304].forEach((y) => {
      meetingChairs.roundRect(500, y, 8, 20, 3).fill(0xc8d1dd); // back
      meetingChairs.roundRect(508, y + 1, 9, 18, 3).fill(0xd6dde7); // seat
      meetingChairs.roundRect(681, y, 8, 20, 3).fill(0xc8d1dd); // back
      meetingChairs.roundRect(672, y + 1, 9, 18, 3).fill(0xd6dde7); // seat
    });
    root.addChild(meetingChairs);

    const storageWall = new Graphics();
    storageWall.rect(916, 84, 32, 360).fill(0xe0e6ee).stroke({ width: 1, color: 0xb9c4d2 });
    for (let y = 96; y < 430; y += 28) {
      storageWall.rect(920, y, 24, 16).fill(0xc8d1de);
    }
    root.addChild(storageWall);

    const plants = new Graphics();
    const plantSpots: [number, number][] = [
      [650, 110],
      [650, 400],
      [892, 110],
      [892, 400],
    ];
    plantSpots.forEach(([x, y]) => {
      plants.roundRect(x - 8, y + 8, 16, 8, 2).fill(0xc2cad5);
      plants.circle(x, y, 10).fill(0x9fb4a0);
      plants.circle(x - 6, y + 2, 6).fill(0xb5c7b6);
      plants.circle(x + 6, y + 2, 6).fill(0xb5c7b6);
    });
    root.addChild(plants);
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
    const isCoordinator = visual.isCoordinator;
    const accent = isSelected
      ? GLOW.blue
      : visual.walkOffset < (Math.PI * 2) / 3
        ? GLOW.blue
        : visual.walkOffset < ((Math.PI * 2) / 3) * 2
          ? GLOW.cyan
          : GLOW.violet;

    const elapsed = timeMs - visual.phaseStartMs;
    const walkCycle = elapsed * 0.012 + visual.walkOffset;
    const typeCycle = elapsed * 0.008;

    let yBob = 0;
    if (phase === 'walk') yBob = Math.sin(walkCycle * 1.1) * 1.2;
    if (phase === 'typing') yBob = Math.sin(typeCycle) * 0.35;
    if (phase === 'stand') yBob = Math.sin(typeCycle * 0.6) * 0.22;

    const scaleY = PHASE_SCALE[phase] + (phase === 'walk' ? Math.abs(Math.sin(walkCycle)) * 0.04 : 0);
    const scaleX = 1 + (phase === 'walk' ? Math.abs(Math.sin(walkCycle + Math.PI / 2)) * 0.04 : 0);
    body.scale.set(scaleX, scaleY);
    body.position.set(0, yBob);

    // Soft radial depth under each agent.
    shadow.clear();
    shadow.ellipse(0, 12, 9 + (phase === 'walk' ? 2 : 0), 4).fill(0x5f6977, 0.14);
    shadow.ellipse(0, 12, 12 + (phase === 'walk' ? 2 : 0), 6).fill(0x5f6977, 0.05);

    body.clear();
    if (isCoordinator) {
      // Coordinator: more human/professional proportions, still stylized for top-down readability.
      const headY = phase === 'sit' ? -7.8 : -10.8;
      const torsoY = phase === 'sit' ? -1.8 : -0.8;
      const torsoH = phase === 'sit' ? 14 : 18;
      const idleBreath = Math.sin(typeCycle * 0.55) * 0.18;

      body.circle(0, headY + idleBreath, 4.8).fill(0xf2ddcc);
      body.circle(-1.35, headY - 0.4 + idleBreath, 0.45).fill(0x374151);
      body.circle(1.35, headY - 0.4 + idleBreath, 0.45).fill(0x374151);
      body.roundRect(-1.2, headY + 1.6 + idleBreath, 2.4, 0.5, 0.2).fill(0x9f7f70, 0.8);

      // Hair cap
      body.roundRect(-4.8, headY - 4.2 + idleBreath, 9.6, 2.8, 1.4).fill(0x4b5563, 0.95);

      // Blazer + shirt/tie
      body.roundRect(-5.3, torsoY, 10.6, torsoH, 3.2).fill(0x2f3a4a);
      body.roundRect(-6.5, torsoY + 2.2, 13, 4.2, 2.2).fill(0x3a4658);
      body.roundRect(-1.35, torsoY + 2.6, 2.7, torsoH - 4.2, 1.1).fill(0xe6e9ee);
      body.roundRect(-0.5, torsoY + 4.2, 1, torsoH - 7.2, 0.6).fill(0x55627a);
      body.roundRect(3.4, torsoY + 3.2, 1.2, torsoH - 6, 0.7).fill(GLOW.violet, 0.45);

      // Arms and legs (minimal because he mostly stays in office).
      body.roundRect(-7.3, torsoY + 3.5, 2.1, 7.2, 1.2).fill(0x3b4758);
      body.roundRect(5.2, torsoY + 3.5, 2.1, 7.2, 1.2).fill(0x3b4758);
      const legY = phase === 'sit' ? torsoY + torsoH - 2 : torsoY + torsoH;
      body.roundRect(-3.8, legY, 2.6, 6.3, 1.1).fill(0x1f2937);
      body.roundRect(1.2, legY, 2.6, 6.3, 1.1).fill(0x1f2937);

      body.rotation = 0;
      if (phase === 'typing') {
        const glowAlpha = 0.06 + Math.abs(Math.sin(typeCycle)) * 0.05;
        body.circle(0, headY + idleBreath, 5.6).fill(GLOW.cyan, glowAlpha);
      }
      return;
    }

    const headY = phase === 'sit' ? -7 : -10;
    const torsoY = phase === 'sit' ? -2 : -1;
    const torsoH = phase === 'sit' ? 13 : 16;

    // Head: small minimal form.
    body.circle(0, headY, 4.2).fill(0xf4f6f9);
    body.circle(-1.2, headY - 0.3, 0.45).fill(0x4b5563);
    body.circle(1.2, headY - 0.3, 0.45).fill(0x4b5563);

    // Torso + shoulders: slim professional silhouette.
    body.roundRect(-4.8, torsoY, 9.6, torsoH, 3.2).fill(0x2f3a4a);
    body.roundRect(-6.2, torsoY + 2.2, 12.4, 3.6, 2).fill(0x3a4657);
    body.roundRect(-1, torsoY + 2.6, 2, torsoH - 4, 1).fill(0xe5e7eb);
    body.roundRect(2.8, torsoY + 2.8, 1.4, torsoH - 5, 1).fill(accent, 0.4);

    // Arms: subtle movement only.
    const armSwing = phase === 'walk' ? Math.sin(walkCycle * 1.25) * 2.2 : phase === 'typing' ? Math.sin(typeCycle) * 0.8 : 0;
    body.roundRect(-7, torsoY + 3 + armSwing * 0.55, 2, 7, 1.2).fill(0x3b4758);
    body.roundRect(5, torsoY + 3 - armSwing * 0.55, 2, 7, 1.2).fill(0x3b4758);

    // Legs: controlled walking cycle, no exaggerated bounce.
    const legOffset = phase === 'walk' ? Math.sin(walkCycle * 1.35) * 3.2 : 0;
    const legY = phase === 'sit' ? torsoY + torsoH - 2 : torsoY + torsoH;
    body.roundRect(-3.6, legY + legOffset * 0.52, 2.5, 6.2, 1.1).fill(0x1f2937);
    body.roundRect(1.1, legY - legOffset * 0.52, 2.5, 6.2, 1.1).fill(0x1f2937);

    // Walking posture: subtle lean/sway to prevent glide look.
    if (phase === 'walk') {
      body.rotation = Math.sin(walkCycle * 0.7) * 0.07;
    } else {
      body.rotation = 0;
    }

    // Typing screen bounce-light on face.
    if (phase === 'typing') {
      const glowAlpha = 0.08 + Math.abs(Math.sin(typeCycle)) * 0.06;
      body.circle(0, headY - 0.1, 5.3).fill(GLOW.cyan, glowAlpha);
    }
  }, []);

  const getLocationContext = useCallback((position: [number, number]): 'printer' | 'coffee' | 'desk' | null => {
    const [x, y] = position;
    const distPrinter = Math.hypot(x - PRINTER.x, y - PRINTER.y);
    const distCoffee = Math.hypot(x - COFFEE.x, y - COFFEE.y);
    if (distPrinter < 16) return 'printer';
    if (distCoffee < 16) return 'coffee';
    const isDesk = DESKS.some((d) => Math.hypot(x - d.x, y - d.y) < 18);
    if (isDesk) return 'desk';
    return null;
  }, []);

  const getDisplayPhase = useCallback((personaPosition: [number, number], phase: AgentPhase): AgentPhase => {
    if (phase !== 'walk') return phase;
    const [x, y] = personaPosition;
    const nearPrinter = Math.hypot(x - PRINTER.x, y - PRINTER.y) < 36;
    const nearCoffee = Math.hypot(x - COFFEE.x, y - COFFEE.y) < 36;
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
        fontSize: 10,
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
          isCoordinator: Boolean(p.isCoordinator),
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

        if (now >= ambientChatAtRef.current && agentsMap.size > 0) {
          const all = [...agentsMap.entries()];
          const [id, visual] = all[Math.floor(Math.random() * all.length)];
          const persona = personasByIdRef.current.get(id);
          if (persona) {
            const line = AMBIENT_CHAT[Math.floor(Math.random() * AMBIENT_CHAT.length)];
            renderBubble(visual, `${persona.name}: ${line}`, now, 1700);
          }
          ambientChatAtRef.current = now + AMBIENT_CHAT_INTERVAL_MS + Math.random() * 1100;
        }

        agentsMap.forEach((visual, id) => {
          if (visual.snapToPosition) {
            visual.agent.x = visual.targetX;
            visual.agent.y = visual.targetY;
          } else {
            const dx = visual.targetX - visual.agent.x;
            const dy = visual.targetY - visual.agent.y;
            visual.agent.x += dx * 0.28;
            visual.agent.y += dy * 0.28;
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
