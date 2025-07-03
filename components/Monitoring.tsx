import React, { useState } from 'react';
import { Activity, BarChart3, Download, Pause, Play, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Monitoring() {
  const [realtime, setRealtime] = useState(true);
  // Mock data for KPIs and logs
  const kpis = [
    { label: 'AGVs Online', value: 8, icon: Activity, color: 'from-green-500 to-emerald-500' },
    { label: 'System Uptime', value: '99.98%', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { label: 'Error Events', value: 2, icon: AlertTriangle, color: 'from-red-500 to-pink-500' },
    { label: 'Pending Pickups', value: 5, icon: CheckCircle, color: 'from-orange-500 to-yellow-500' },
  ];
  const logs = [
    { time: '04:10', type: 'fetch', desc: 'Pallet 123 fetched from Zone A' },
    { time: '04:12', type: 'error', desc: 'AGV 2 route delay at RMS A' },
    { time: '04:15', type: 'delivery', desc: 'Pallet 456 delivered to Supermarket C' },
  ];
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Monitoring</span>
      </nav>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Activity className="w-6 h-6 text-primary-500" /> Real-Time Monitoring</h1>
        <button className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" /> Export Logs</button>
      </div>
      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`card-glass flex flex-col items-center p-4 bg-gradient-to-r ${kpi.color}`}>
            <kpi.icon className="w-6 h-6 mb-2 text-white" />
            <div className="text-lg font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-white/80">{kpi.label}</div>
          </div>
        ))}
      </div>
      {/* Real-time Chart */}
      <div className="card-glass h-56 flex flex-col items-center justify-center mt-4">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-500" /> Pallet Fetch Frequency</h2>
        <div className="flex-1 flex items-center justify-center text-gray-400">[Real-Time Chart Placeholder]</div>
      </div>
      {/* Status Indicators & Toggle */}
      <div className="flex items-center gap-4 mt-4">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></span>
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
        </div>
        <button onClick={() => setRealtime(v => !v)} className="btn-secondary flex items-center gap-1">
          {realtime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {realtime ? 'Pause' : 'Resume'} Real-Time
        </button>
      </div>
      {/* Log Panel */}
      <div className="card-glass mt-4">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Recent Events</h2>
        <div className="overflow-y-auto max-h-40">
          <ul className="divide-y divide-gray-100">
            {logs.map((log, i) => (
              <li key={i} className="py-2 flex items-center gap-3 text-sm">
                <span className="text-xs text-gray-400 w-12">{log.time}</span>
                <span className={`font-semibold ${log.type === 'error' ? 'text-red-500' : 'text-gray-700'}`}>{log.type}</span>
                <span className="text-gray-700">{log.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 