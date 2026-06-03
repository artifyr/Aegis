'use client';

import { useState, useMemo } from 'react';
import { useTacticalStore } from '@/store/tactical-store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Activity,
  Flame,
  Zap,
  Copy,
  MapPin,
  ExternalLink,
  Globe,
  Calendar,
  Hash,
  X,
  Search,
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';

export default function ArchivePage() {
  const store = useTacticalStore();
  const router = useRouter();

  // Filtering states
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  // Detail selection states
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Sorting states
  const [sortColumn, setSortColumn] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Consolidate all records into a single uniform array
  const allRecords = useMemo(() => {
    const records: any[] = [];

    store.strategicBases.forEach(b => records.push({
      id: b.id || Math.random().toString(),
      type: 'STRATEGIC_BASE',
      name: b.name || b.codename || b.callsign || 'UNKNOWN BASE',
      location: `${b.lat?.toFixed(5)}, ${b.lng?.toFixed(5)}`,
      lat: b.lat,
      lng: b.lng,
      classification: b.status === 'INACTIVE' ? 'RESTRICTED' : 'TOP_SECRET',
      date: new Date().toISOString().split('T')[0],
      detail: b.type?.replace('_', ' ') || 'MILITARY INSTALLATION',
      status: b.status || 'ACTIVE',
      country: b.country || 'UNKNOWN',
      raw: b
    }));

    store.nuclearFacilities.forEach(n => records.push({
      id: n.id || Math.random().toString(),
      type: 'NUCLEAR_FACILITY',
      name: n.name || n.facility || 'UNKNOWN FACILITY',
      location: `${n.lat?.toFixed(5)}, ${n.lng?.toFixed(5)}`,
      lat: n.lat,
      lng: n.lng,
      classification: n.status?.includes('SEISMIC') ? 'TOP_SECRET' : 'RESTRICTED',
      date: new Date().toISOString().split('T')[0],
      detail: `${n.reactors} Reactors · ${n.capacityMW} MW`,
      status: n.status || 'OPERATIONAL',
      country: n.country || 'UNKNOWN',
      raw: n
    }));

    store.incidents.forEach(i => records.push({
      id: i.id || Math.random().toString(),
      type: 'INCIDENT',
      name: i.name || i.title || 'UNCLASSIFIED INCIDENT',
      location: `${i.lat?.toFixed(5)}, ${i.lng?.toFixed(5)}`,
      lat: i.lat,
      lng: i.lng,
      classification: 'CLASSIFIED',
      date: i.date || new Date().toISOString().split('T')[0],
      detail: i.description || i.severity || 'SECURITY EVENT',
      status: 'CRITICAL',
      country: 'GLOBAL FEED',
      raw: i
    }));

    store.earthquakes.forEach(e => records.push({
      id: e.id || Math.random().toString(),
      type: 'SEISMIC_EVENT',
      name: e.place || 'SEISMIC ANOMALY',
      location: `${e.lat?.toFixed(5)}, ${e.lng?.toFixed(5)}`,
      lat: e.lat,
      lng: e.lng,
      classification: 'UNCLASSIFIED',
      date: e.time ? new Date(e.time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      detail: `Magnitude ${e.mag || e.magnitude || '?'}`,
      status: (e.mag || 0) >= 6.0 ? 'CRITICAL' : 'MONITORED',
      country: 'TECTONIC BOUNDARY',
      raw: e
    }));

    (store.gpsJamming || []).forEach((z, idx) => records.push({
      id: `JAM-${idx}-${z.lat.toFixed(2)}-${z.lng.toFixed(2)}`,
      type: 'GPS_JAMMING',
      name: `GPS JAMMING SECTOR ${idx + 1}`,
      location: `${z.lat?.toFixed(5)}, ${z.lng?.toFixed(5)}`,
      lat: z.lat,
      lng: z.lng,
      classification: z.severity >= 50 ? 'TOP_SECRET' : 'CLASSIFIED',
      date: new Date().toISOString().split('T')[0],
      detail: `Degraded GPS accuracy (Severity ${z.severity}%)`,
      status: z.severity >= 50 ? 'CRITICAL' : 'ELEVATED',
      country: 'INTL AIRSPACE',
      raw: z
    }));

    return records;
  }, [store.strategicBases, store.nuclearFacilities, store.incidents, store.earthquakes, store.gpsJamming]);

  // Unique country listing for the country filter
  const countries = useMemo(() => {
    const list = new Set<string>();
    allRecords.forEach(r => {
      if (r.country && r.country !== 'GLOBAL FEED' && r.country !== 'TECTONIC BOUNDARY' && r.country !== 'UNKNOWN') {
        list.add(r.country);
      }
    });
    return Array.from(list).sort();
  }, [allRecords]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return allRecords.filter(rec => {
      if (activeTab !== 'ALL' && rec.type !== activeTab) return false;
      if (selectedCountry !== 'ALL' && rec.country !== selectedCountry) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          rec.name.toLowerCase().includes(q) ||
          rec.id.toString().toLowerCase().includes(q) ||
          rec.location.includes(q) ||
          rec.detail.toLowerCase().includes(q) ||
          rec.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRecords, activeTab, selectedCountry, searchQuery]);

  // Sorted dataset based on column and order
  const sortedRecords = useMemo(() => {
    const sorted = [...filteredRecords];
    sorted.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortColumn) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'classification':
          valA = a.classification;
          valB = b.classification;
          break;
        case 'type':
          valA = a.type;
          valB = b.type;
          break;
        case 'country':
          valA = a.country;
          valB = b.country;
          break;
        case 'location':
          valA = a.location;
          valB = b.location;
          break;
        case 'date':
          valA = a.date;
          valB = b.date;
          break;
        case 'magnitude':
          valA = a.type === 'SEISMIC_EVENT' ? (a.raw?.mag || a.raw?.magnitude || 0) : 0;
          valB = b.type === 'SEISMIC_EVENT' ? (b.raw?.mag || b.raw?.magnitude || 0) : 0;
          break;
        case 'reactors':
          valA = a.type === 'NUCLEAR_FACILITY' ? (a.raw?.reactors || 0) : 0;
          valB = b.type === 'NUCLEAR_FACILITY' ? (b.raw?.reactors || 0) : 0;
          break;
        case 'capacity':
          valA = a.type === 'NUCLEAR_FACILITY' ? (a.raw?.capacityMW || 0) : 0;
          valB = b.type === 'NUCLEAR_FACILITY' ? (b.raw?.capacityMW || 0) : 0;
          break;
        case 'baseType':
          valA = a.type === 'STRATEGIC_BASE' ? (a.raw?.type || '') : '';
          valB = b.type === 'STRATEGIC_BASE' ? (b.raw?.type || '') : '';
          break;
        case 'severity':
          valA = a.type === 'GPS_JAMMING' ? (a.raw?.severity || 0) : 0;
          valB = b.type === 'GPS_JAMMING' ? (b.raw?.severity || 0) : 0;
          break;
        case 'detail':
          valA = a.detail;
          valB = b.detail;
          break;
        default:
          valA = a.date;
          valB = b.date;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc'
          ? (valA > valB ? 1 : -1)
          : (valB > valA ? 1 : -1);
      }
    });
    return sorted;
  }, [filteredRecords, sortColumn, sortDirection]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <span className="inline-block ml-1 opacity-25">↕</span>;
    return sortDirection === 'asc' ?
      <span className="inline-block ml-1 text-[#3cdcd1] font-bold">↑</span> :
      <span className="inline-block ml-1 text-[#3cdcd1] font-bold">↓</span>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const locateOnMap = (rec: any) => {
    let targetLayer: 'threats_strategic' | 'threats_nuclear' | 'threats_incidents' | 'hazards_earthquakes' | 'threats_jamming' | null = null;
    if (rec.type === 'STRATEGIC_BASE') targetLayer = 'threats_strategic';
    else if (rec.type === 'NUCLEAR_FACILITY') targetLayer = 'threats_nuclear';
    else if (rec.type === 'INCIDENT') targetLayer = 'threats_incidents';
    else if (rec.type === 'SEISMIC_EVENT') targetLayer = 'hazards_earthquakes';
    else if (rec.type === 'GPS_JAMMING') targetLayer = 'threats_jamming';

    if (targetLayer && !store.layers[targetLayer]) {
      store.toggleLayer(targetLayer);
    }

    store.setMapCommand({
      type: 'flyTo',
      lat: rec.lat,
      lng: rec.lng,
      zoom: rec.type === 'INCIDENT' ? 8 : 6
    });

    store.setActiveEntityId(rec.id);
    router.push('/');
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'STRATEGIC_BASE':
        return <Shield className="w-4 h-4 text-[#3cdcd1]" />;
      case 'NUCLEAR_FACILITY':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'INCIDENT':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'SEISMIC_EVENT':
        return <Activity className="w-4 h-4 text-orange-400" />;
      case 'GPS_JAMMING':
        return <Radio className="w-4 h-4 text-red-500 animate-pulse" />;
      default:
        return <Database className="w-4 h-4 text-white/55" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'TOP_SECRET':
        return 'border-red-500/40 text-red-400 bg-red-950/30';
      case 'RESTRICTED':
        return 'border-yellow-500/40 text-yellow-400 bg-yellow-950/30';
      case 'CLASSIFIED':
        return 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30';
      default:
        return 'border-white/20 text-white/60 bg-white/5';
    }
  };

  return (
    <main className="flex-1 w-full relative bg-[#090a0f] h-full overflow-hidden flex flex-col pt-16">
      {/* Top Header Panel */}
      <div className="bg-black/60 backdrop-blur-md border-b border-white/5 px-8 py-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 border border-white/10 hover:border-[#3cdcd1] hover:text-[#3cdcd1] rounded-none transition-colors group flex items-center justify-center bg-white/5"
            title="Return to Live Map"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg font-headline uppercase tracking-widest flex items-center gap-2">
              <Database className="w-5 h-5 text-[#3cdcd1]" /> INTELLIGENCE ARCHIVE
            </h1>
            <p className="font-mono text-[9px] text-white/40 mt-0.5 tracking-wider">
              OFFLINE TELEMETRY ARCHIVE // TOTAL_INDEXED: {allRecords.length}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:max-w-xl justify-end">
          {/* Country Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 min-w-[180px]">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest whitespace-nowrap">COUNTRY:</span>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedRecord(null);
              }}
              className="bg-transparent text-white font-mono text-[10px] rounded-none outline-none cursor-pointer w-full uppercase tracking-wider font-semibold pr-8"
            >
              <option value="ALL" className="bg-[#0d0e12] text-white">ALL COUNTRIES</option>
              {countries.map(c => (
                <option key={c} value={c} className="bg-[#0d0e12] text-white">{c}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="SEARCH REGISTRY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 py-2 pl-9 pr-3 text-[10px] font-mono text-white placeholder-white/30 rounded-none outline-none focus:border-[#3cdcd1]/50 focus:bg-white/10 transition-colors uppercase tracking-wider font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Left Side: Table & Filters */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 md:p-8">
          {/* Tabs / Filter Controls */}
          <div className="flex flex-wrap gap-1.5 mb-5 flex-shrink-0">
            {['ALL', 'STRATEGIC_BASE', 'NUCLEAR_FACILITY', 'INCIDENT', 'SEISMIC_EVENT', 'GPS_JAMMING'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedRecord(null);
                }}
                className={`px-3 py-1.5 text-[9px] font-mono tracking-wider transition-colors border font-semibold ${activeTab === tab
                  ? 'border-[#3cdcd1] bg-[#3cdcd1]/15 text-[#3cdcd1]'
                  : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Database Table Container */}
          <div className="flex-1 border border-white/5 bg-black/40 overflow-hidden relative flex flex-col">
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#0d0e12] border-b border-white/5 shadow-md">
                  <tr className="text-[9px] font-mono text-white/40 uppercase tracking-widest">

                    {/* Common Column: Record ID */}
                    <th
                      onClick={() => handleSort('id')}
                      className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'id' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                    >
                      RECORD ID {renderSortIcon('id')}
                    </th>

                    {/* Common Column: Designation */}
                    <th
                      onClick={() => handleSort('name')}
                      className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'name' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                    >
                      DESIGNATION {renderSortIcon('name')}
                    </th>

                    {/* Common Column: Classification */}
                    <th
                      onClick={() => handleSort('classification')}
                      className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'classification' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                    >
                      CLASSIFICATION {renderSortIcon('classification')}
                    </th>

                    {/* Dynamic Tabs Columns */}
                    {activeTab === 'ALL' && (
                      <th
                        onClick={() => handleSort('type')}
                        className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'type' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                      >
                        CATEGORY {renderSortIcon('type')}
                      </th>
                    )}

                    {activeTab === 'STRATEGIC_BASE' && (
                      <th
                        onClick={() => handleSort('baseType')}
                        className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'baseType' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                      >
                        BASE TYPE {renderSortIcon('baseType')}
                      </th>
                    )}

                    {activeTab === 'NUCLEAR_FACILITY' && (
                      <>
                        <th
                          onClick={() => handleSort('reactors')}
                          className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'reactors' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                        >
                          REACTORS {renderSortIcon('reactors')}
                        </th>
                        <th
                          onClick={() => handleSort('capacity')}
                          className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'capacity' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                        >
                          POWER CAPACITY {renderSortIcon('capacity')}
                        </th>
                      </>
                    )}

                    {activeTab === 'SEISMIC_EVENT' && (
                      <th
                        onClick={() => handleSort('magnitude')}
                        className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'magnitude' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                      >
                        MAGNITUDE {renderSortIcon('magnitude')}
                      </th>
                    )}

                    {activeTab === 'GPS_JAMMING' && (
                      <th
                        onClick={() => handleSort('severity')}
                        className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'severity' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                      >
                        SEVERITY {renderSortIcon('severity')}
                      </th>
                    )}

                    {activeTab === 'INCIDENT' && (
                      <th
                        onClick={() => handleSort('detail')}
                        className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'detail' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                      >
                        DETAILS {renderSortIcon('detail')}
                      </th>
                    )}

                    {/* Common Column: Country */}
                    <th
                      onClick={() => handleSort('country')}
                      className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'country' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                    >
                      COUNTRY {renderSortIcon('country')}
                    </th>

                    {/* Common Column: Coordinates */}
                    <th
                      onClick={() => handleSort('location')}
                      className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors ${sortColumn === 'location' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                    >
                      COORDINATES {renderSortIcon('location')}
                    </th>

                    {/* Common Column: Date */}
                    <th
                      onClick={() => handleSort('date')}
                      className={`p-4 font-bold cursor-pointer hover:bg-white/5 hover:text-white transition-colors text-right ${sortColumn === 'date' ? 'text-white border-b border-[#3cdcd1]' : ''}`}
                    >
                      DATE LOGGED {renderSortIcon('date')}
                    </th>

                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedRecords.map((rec, i) => (
                    <tr
                      key={rec.id + '-' + i}
                      onClick={() => setSelectedRecord(rec)}
                      className={`hover:bg-white/5 transition-all cursor-pointer text-[11px] font-mono text-white font-medium group ${selectedRecord?.id === rec.id ? 'bg-white/5 border-l-2 border-l-[#3cdcd1]' : ''
                        }`}
                    >

                      {/* ID Column */}
                      <td className="p-4 text-white/50 group-hover:text-white transition-colors flex items-center gap-2">
                        {getCategoryIcon(rec.type)}
                        <span className="font-semibold">{rec.id.toString().slice(0, 10).toUpperCase()}</span>
                      </td>

                      {/* Designation */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white group-hover:text-[#3cdcd1] transition-colors text-xs">{rec.name}</span>
                          {activeTab === 'ALL' && (
                            <span className="text-[9px] text-white/40 mt-0.5 truncate max-w-[200px]">{rec.detail}</span>
                          )}
                        </div>
                      </td>

                      {/* Classification Badge */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[9px] border font-bold tracking-wider rounded-none ${getClassificationColor(rec.classification)}`}>
                          {rec.classification}
                        </span>
                      </td>

                      {/* Dynamic Columns data */}
                      {activeTab === 'ALL' && (
                        <td className="p-4 text-white/60 font-semibold">{rec.type.replace('_', ' ')}</td>
                      )}

                      {activeTab === 'STRATEGIC_BASE' && (
                        <td className="p-4 text-white font-bold uppercase tracking-wider text-[10px]">{rec.detail}</td>
                      )}

                      {activeTab === 'NUCLEAR_FACILITY' && (
                        <>
                          <td className="p-4 text-white font-bold text-xs">{rec.raw?.reactors || '0'}</td>
                          <td className="p-4 text-[#3cdcd1] font-bold text-xs">{rec.raw?.capacityMW || '0'} MW</td>
                        </>
                      )}

                      {activeTab === 'SEISMIC_EVENT' && (
                        <td className="p-4 text-orange-400 font-bold text-xs">
                          M {rec.raw?.mag || rec.raw?.magnitude || '?'}
                        </td>
                      )}

                      {activeTab === 'GPS_JAMMING' && (
                        <td className="p-4 text-red-500 font-bold text-xs">
                          {rec.raw?.severity}% JAM
                        </td>
                      )}

                      {activeTab === 'INCIDENT' && (
                        <td className="p-4 text-white/60 truncate max-w-[250px]">{rec.detail}</td>
                      )}

                      {/* Country */}
                      <td className="p-4 text-white/60">{rec.country}</td>

                      {/* Coordinates */}
                      <td className="p-4 text-white/50">{rec.location}</td>

                      {/* Date Logged */}
                      <td className="p-4 text-right text-white/50">{rec.date}</td>

                    </tr>
                  ))}
                </tbody>
              </table>

              {sortedRecords.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <Database className="w-10 h-10 text-white/10 mb-4 animate-pulse" />
                  <span className="text-[10px] font-mono text-white/30 tracking-widest">NO DIRECTIVES OR ARCHIVES LOCATED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Intelligence Viewer Panel */}
        <AnimatePresence>
          {selectedRecord && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full md:w-[400px] border-l border-white/5 bg-black/60 backdrop-blur-md flex flex-col h-full z-30 absolute inset-y-0 right-0 md:static flex-shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#3cdcd1] rounded-full animate-pulse" />
                  <span className="font-mono text-[9px] text-[#3cdcd1] tracking-widest uppercase font-bold">DETAILED INTEL REPORT</span>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Contents */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

                {/* Title and ID */}
                <div>
                  <div className="flex items-center gap-2 text-white/30 font-mono text-[8px] tracking-widest uppercase mb-1">
                    {getCategoryIcon(selectedRecord.type)}
                    <span>{selectedRecord.type.replace('_', ' ')} // {selectedRecord.id.toString().slice(0, 12).toUpperCase()}</span>
                  </div>
                  <h2 className="text-white text-base font-bold font-headline leading-tight tracking-wide">
                    {selectedRecord.name}
                  </h2>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
                  <div className="bg-white/5 border border-white/5 p-3 flex flex-col gap-1">
                    <span className="text-white/30 uppercase tracking-wider">CLASSIFICATION</span>
                    <span className={`font-bold ${selectedRecord.classification === 'TOP_SECRET' ? 'text-red-400' :
                      selectedRecord.classification === 'RESTRICTED' ? 'text-yellow-400' : 'text-cyan-400'
                      }`}>{selectedRecord.classification}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-3 flex flex-col gap-1">
                    <span className="text-white/30 uppercase tracking-wider">OPERATIONAL STATUS</span>
                    <span className="font-bold text-[#3cdcd1] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#3cdcd1] rounded-full animate-pulse" />
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>

                {/* Map Coordinates with Copy Tool */}
                <div className="border border-white/5 bg-white/5 p-4 rounded-none space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[8px] text-white/30 tracking-widest uppercase">COORDINATES (LAT/LNG)</span>
                    <button
                      onClick={() => copyToClipboard(selectedRecord.location)}
                      className="p-1 hover:bg-white/5 border border-white/10 rounded-none transition-colors text-white/50 hover:text-white flex items-center gap-1 text-[8px] font-mono"
                    >
                      {copied ? <CheckCircle2 className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5" />}
                      {copied ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-white font-mono text-xs">
                    <MapPin className="w-4 h-4 text-[#3cdcd1]" />
                    <span>{selectedRecord.location}</span>
                  </div>
                </div>

                {/* Sub-details breakdown based on Type */}
                <div className="space-y-3">
                  <span className="font-mono text-[8px] text-white/30 tracking-widest uppercase block border-b border-white/5 pb-1">DATABASE RECORDS</span>

                  <div className="space-y-2.5 font-mono text-[10px]">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-white/40 font-semibold">COUNTRY / ZONE:</span>
                      <span className="text-white font-bold">{selectedRecord.country}</span>
                    </div>

                    {selectedRecord.type === 'STRATEGIC_BASE' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">DESIGNATION TYPE:</span>
                          <span className="text-white font-bold">{selectedRecord.detail}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">CALLSIGN:</span>
                          <span className="text-[#3cdcd1] font-bold">{selectedRecord.raw?.callsign || 'N/A'}</span>
                        </div>
                      </>
                    )}

                    {selectedRecord.type === 'NUCLEAR_FACILITY' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">REACTOR COUNT:</span>
                          <span className="text-white font-bold">{selectedRecord.raw?.reactors || '0'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">POWER CAPACITY:</span>
                          <span className="text-[#3cdcd1] font-bold">{selectedRecord.raw?.capacityMW || '0'} MW</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">FACILITY OWNER:</span>
                          <span className="text-white font-bold">{selectedRecord.raw?.owner || 'UNKNOWN'}</span>
                        </div>
                      </>
                    )}

                    {selectedRecord.type === 'INCIDENT' && (
                      <>
                        <div className="flex flex-col gap-1 py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">OSINT DESCRIPTION:</span>
                          <p className="text-white/80 leading-normal mt-1 text-[10px]">{selectedRecord.detail}</p>
                        </div>
                        {selectedRecord.raw?.url && (
                          <a
                            href={selectedRecord.raw.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[#3cdcd1] hover:underline pt-2 font-bold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> OPEN PRIMARY SOURCE FEED
                          </a>
                        )}
                      </>
                    )}

                    {selectedRecord.type === 'SEISMIC_EVENT' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">SEISMIC MAGNITUDE:</span>
                          <span className="text-red-400 font-bold">{selectedRecord.detail}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">TELEMETRY SOURCE:</span>
                          <span className="text-white font-bold">USGS EARTHQUAKE FEED</span>
                        </div>
                      </>
                    )}

                    {selectedRecord.type === 'GPS_JAMMING' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">JAMMING SEVERITY:</span>
                          <span className="text-red-400 font-bold">{selectedRecord.raw?.severity}%</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-[#a855f7] font-semibold">AFFECTED AIRCRAFT:</span>
                          <span className="text-white font-bold">{selectedRecord.raw?.count} tracked</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-white/40 font-semibold">DETECTION METHOD:</span>
                          <span className="text-white font-bold">NACp DEGRADATION GRID</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Tactical Actions Card */}
                <div className="bg-red-950/10 border border-red-500/15 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[8px] font-mono text-red-400 font-bold tracking-widest">
                    <AlertTriangle className="w-3.5 h-3.5" /> OVERRIDE CONFIRMATION REQUIRED
                  </div>
                  <p className="text-[8.5px] font-mono text-white/55 leading-relaxed">
                    Deploying satellite tracking parameters will redirect live camera grids, orbit feeds, and sensor arrays directly to this sector.
                  </p>
                  <button
                    onClick={() => locateOnMap(selectedRecord)}
                    className="w-full bg-[#3cdcd1] hover:bg-[#2cbcb1] text-black font-bold font-mono py-2.5 px-4 text-[10px] tracking-wider transition-colors flex items-center justify-center gap-2 rounded-none"
                  >
                    <Globe className="w-4 h-4" /> DEPLOY TELEMETRY OVERRIDE
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
