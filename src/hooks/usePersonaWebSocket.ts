'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePersonaStore } from '@/store/usePersonaStore';
import type { PersonaStatus } from '@/types/persona';

interface PersonaStateMessage {
  type: 'persona_state';
  id: string;
  status: PersonaStatus;
  currentTask?: string;
  errorMessage?: string;
}

/** Connect to WebSocket server for real-time persona state. Use mock in dev if no server. */
export function usePersonaWebSocket(url?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const updatePersonaStatus = usePersonaStore((s) => s.updatePersonaStatus);
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [connected, setConnected] = useState(!url);

  const connect = useCallback(
    (wsUrl: string) => {
      try {
        const ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as PersonaStateMessage;
            if (data.type === 'persona_state' && data.id) {
              updatePersonaStatus(data.id, data.status, {
                currentTask: data.currentTask,
                errorMessage: data.errorMessage,
              });
            }
          } catch {
            // ignore parse errors
          }
        };
        ws.onopen = () => {
          setConnected(true);
        };
        ws.onclose = () => {
          wsRef.current = null;
          setConnected(false);
        };
        ws.onerror = () => {
          setConnected(false);
        };
        wsRef.current = ws;
      } catch {
        wsRef.current = null;
      }
    },
    [updatePersonaStatus]
  );

  useEffect(() => {
    if (url) {
      connect(url);
    } else {
      // Mock: cycle statuses for demo
      mockIntervalRef.current = setInterval(() => {
        const statuses: PersonaStatus[] = ['idle', 'working', 'alert'];
        const ids = ['openclaw', 'sentinel', 'scribe', 'nexus'];
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        updatePersonaStatus(randomId, randomStatus, {
          currentTask: randomStatus === 'working' ? 'Processing...' : undefined,
          errorMessage: randomStatus === 'alert' ? 'Attention required' : undefined,
        });
      }, 8000);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
    };
  }, [url, connect, updatePersonaStatus]);

  return { connected };
}
