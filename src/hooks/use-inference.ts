'use client';

import { useState, useEffect, useCallback } from 'react';

interface Alert {
  alert_id: string;
  timestamp: string;
  priority: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  classification: string;
  confidence: number;
  border_color: string;
  glow: boolean;
}

interface Detection {
  detection_id: string;
  classification: string;
  confidence: number;
  bbox: number[];
  timestamp: string;
}

interface ScanResult {
  scan_id: string;
  timestamp: string;
  chip_count: number;
  total_detections: number;
  high_value_targets: Detection[];
}

interface ChangeReport {
  change_id: string;
  new_signatures: Detection[];
  moved_assets: any[];
  gone_assets: Detection[];
  summary: { new_count: number; moved_count: number; gone_count: number };
  alerts: Alert[];
}

interface TimelineFetchResult {
  acquisition: {
    satellite: string;
    band: string;
    acquisition_date: string;
    cloud_cover_pct: number;
  };
  scan: ScanResult;
  change_report: ChangeReport | null;
}

const API_BASE = 'http://127.0.0.1:8002';

export function useInference() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [latestScan, setLatestScan] = useState<ScanResult | null>(null);
  const [changeReport, setChangeReport] = useState<ChangeReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const fetchTimelineImagery = useCallback(async (date: string) => {
    setIsScanning(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/inference/timeline/fetch?lat=34.05&lng=-118.24&date=${date}`,
        { method: 'POST' }
      );
      const data: TimelineFetchResult = await res.json();

      setLatestScan(data.scan);

      if (data.change_report) {
        setChangeReport(data.change_report);
        // Prepend new alerts, keep max 20
        setAlerts((prev) => {
          const merged = [...(data.change_report?.alerts || []), ...prev];
          return merged.slice(0, 20);
        });
      }
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  return { alerts, latestScan, changeReport, isScanning, fetchTimelineImagery };
}
