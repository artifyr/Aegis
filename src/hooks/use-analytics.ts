'use client';

import { useState, useEffect, useCallback } from 'react';

interface TrendDay {
  date: string;
  naval: number;
  aerial: number;
  ground: number;
}

interface Sector {
  id: string;
  confidence: number;
  status: string;
}

interface AnalyticsSummary {
  timestamp: string;
  total_assets: number;
  classification_counts: Record<string, number>;
  avg_velocity_kts: number;
  max_velocity_kts: number;
  trend_30d: TrendDay[];
  sectors: Sector[];
  system: {
    uptime_pct: number;
    latency_ms: number;
    ws_connections: number;
    inference_scans_24h: number;
  };
}

const API = 'http://127.0.0.1:8002';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/analytics/summary`);
      const json: AnalyticsSummary = await res.json();
      setData(json);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, loading, refresh };
}
