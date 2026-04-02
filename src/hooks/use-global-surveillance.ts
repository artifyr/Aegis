'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface TrackedAsset {
  id: string;
  classification: string;
  callsign?: string;
  velocity: number;
  altitude: number;
  lat: number;
  lng: number;
  last_updated: string;
}

const WS_URL = 'ws://127.0.0.1:8002/ws/global-surveillance';
const RECONNECT_INTERVAL = 3000; // 3 seconds between retries
const MAX_RETRIES = 10;

export function useGlobalSurveillance() {
  const [assets, setAssets] = useState<TrackedAsset[]>([]);
  const [status, setStatus] = useState<'CONNECTING' | 'LIVE' | 'DISCONNECTED'>('CONNECTING');
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // Don't connect during SSR
    if (typeof window === 'undefined') return;

    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
    }

    setStatus('CONNECTING');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('LIVE');
        retriesRef.current = 0; // Reset retries on success
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.assets) setAssets(data.assets);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setStatus('DISCONNECTED');
        // Auto-reconnect with backoff
        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current += 1;
          timerRef.current = setTimeout(connect, RECONNECT_INTERVAL);
        }
      };

      ws.onerror = () => {
        // onerror is always followed by onclose, so reconnect logic lives there
        setStatus('DISCONNECTED');
      };
    } catch {
      setStatus('DISCONNECTED');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { assets, status };
}
