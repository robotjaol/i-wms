import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, Download, Pause, Play, AlertTriangle, CheckCircle, Clock, Zap, Wifi, WifiOff, RefreshCw, Eye, EyeOff, TrendingUp, Server, Database, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Monitoring() {
  const [realtime, setRealtime] = useState(true);
  const [historicalMode, setHistoricalMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState('all');
  const [logLevel, setLogLevel] = useState('all');

  // Enhanced mock data
  const kpis = [
    { label: 'AGVs Online', value: 8, total: 10, icon: Activity, color: 'from-green-500 to-emerald-500', trend: '+2' },
    { label: 'System Uptime', value: '99.98%', total: '100%', icon: Clock, color: 'from-blue-500 to-cyan-500', trend: '+0.02%' },
    { label: 'Error Events', value: 2, total: 50, icon: AlertTriangle, color: 'from-red-500 to-pink-500', trend: '-3' },
    { label: 'Pending Pickups', value: 5, total: 20, icon: CheckCircle, color: 'from-orange-500 to-yellow-500', trend: '-2' },
  ];

  const warehouseSections = [
    { name: 'Zone A', status: 'operational', agvCount: 2, palletCount: 45, lastActivity: '2 min ago' },
    { name: 'Zone B', status: 'operational', agvCount: 1, palletCount: 32, lastActivity: '5 min ago' },
    { name: 'Zone C', status: 'warning', agvCount: 0, palletCount: 18, lastActivity: '15 min ago' },
    { name: 'Loading Dock', status: 'operational', agvCount: 1, palletCount: 12, lastActivity: '1 min ago' },
    { name: 'RMS A', status: 'operational', agvCount: 2, palletCount: 28, lastActivity: '3 min ago' },
    { name: 'RMS B', status: 'error', agvCount: 0, palletCount: 8, lastActivity: '25 min ago' },
  ];

  const fetchFrequencyData = [
    { zone: 'Zone A', frequency: 12, trend: 'up' },
    { zone: 'Zone B', frequency: 8, trend: 'stable' },
    { zone: 'Zone C', frequency: 3, trend: 'down' },
    { zone: 'Loading Dock', frequency: 15, trend: 'up' },
    { zone: 'RMS A', frequency: 10, trend: 'up' },
    { zone: 'RMS B', frequency: 2, trend: 'down' },
  ];

  const logs = [
    { time: '04:10', type: 'fetch', desc: 'Pallet 123 fetched from Zone A', level: 'info', agvId: 'AGV-001' },
    { time: '04:12', type: 'error', desc: 'AGV 2 route delay at RMS A', level: 'error', agvId: 'AGV-002' },
    { time: '04:15', type: 'delivery', desc: 'Pallet 456 delivered to Supermarket C', level: 'info', agvId: 'AGV-003' },
    { time: '04:18', type: 'conflict', desc: 'Batch conflict detected in Zone B', level: 'warning', agvId: 'AGV-001' },
    { time: '04:20', type: 'fetch', desc: 'Pallet 789 fetched from Loading Dock', level: 'info', agvId: 'AGV-004' },
    { time: '04:22', type: 'error', desc: 'Communication timeout with AGV-005', level: 'error', agvId: 'AGV-005' },
    { time: '04:25', type: 'delivery', desc: 'Pallet 101 delivered to Zone A', level: 'info', agvId: 'AGV-001' },
  ];

  const systemHealth = {
    backend: { status: 'healthy', responseTime: '45ms', lastCheck: '30s ago' },
    database: { status: 'healthy', connections: 12, lastCheck: '30s ago' },
    agvNetwork: { status: 'warning', connected: 8, total: 10, lastCheck: '30s ago' },
    sensors: { status: 'healthy', active: 156, total: 160, lastCheck: '30s ago' },
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!realtime) return;
    
    const interval = setInterval(() => {
      // Simulate real-time data updates
      console.log('Real-time update...');
    }, 5000);

    return () => clearInterval(interval);
  }, [realtime]);

  const renderKpiTile = (kpi: any, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card-glass flex flex-col items-center p-4 bg-gradient-to-r ${kpi.color} relative overflow-hidden`}
    >
      <div className="absolute top-2 right-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          kpi.trend.startsWith('+') ? 'bg-green-200 text-green-800' :
          kpi.trend.startsWith('-') ? 'bg-red-200 text-red-800' :
          'bg-blue-200 text-blue-800'
        }`}>
          {kpi.trend}
        </span>
      </div>
      <kpi.icon className="w-6 h-6 mb-2 text-white" />
      <div className="text-lg font-bold text-white">{kpi.value}</div>
      <div className="text-xs text-white/80">{kpi.label}</div>
      {kpi.total && (
        <div className="text-xs text-white/60 mt-1">
          {typeof kpi.value === 'number' ? `${kpi.value}/${kpi.total}` : kpi.total}
        </div>
      )}
    </motion.div>
  );

  const renderStatusIndicator = (section: any, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`card-glass p-3 ${
        section.status === 'operational' ? 'border-green-200 bg-green-50' :
        section.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm">{section.name}</span>
        <div className={`w-3 h-3 rounded-full ${
          section.status === 'operational' ? 'bg-green-500 animate-pulse' :
          section.status === 'warning' ? 'bg-yellow-500 animate-pulse' :
          'bg-red-500 animate-pulse'
        }`} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-600">AGVs:</span>
          <span className="font-semibold ml-1">{section.agvCount}</span>
        </div>
        <div>
          <span className="text-gray-600">Pallets:</span>
          <span className="font-semibold ml-1">{section.palletCount}</span>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{section.lastActivity}</div>
    </motion.div>
  );

  const renderRealTimeChart = () => (
    <div className="h-56 flex items-end justify-center space-x-2 p-4">
      {fetchFrequencyData.map((zone, i) => (
        <div key={i} className="flex flex-col items-center space-y-1">
          <div className="relative">
            <div 
              className="w-8 bg-blue-500 rounded-t transition-all duration-500"
              style={{ height: `${(zone.frequency / 15) * 120}px` }}
            />
            {zone.trend === 'up' && (
              <TrendingUp className="absolute -top-2 -right-2 w-3 h-3 text-green-500" />
            )}
            {zone.trend === 'down' && (
              <TrendingUp className="absolute -top-2 -right-2 w-3 h-3 text-red-500 rotate-180" />
            )}
          </div>
          <span className="text-xs text-gray-600">{zone.zone}</span>
          <span className="text-xs font-semibold">{zone.frequency}/hr</span>
        </div>
      ))}
    </div>
  );

  const renderSystemHealth = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(systemHealth).map(([key, health]) => (
        <div key={key} className="card-glass p-3">
          <div className="flex items-center gap-2 mb-2">
            {key === 'backend' && <Server className="w-4 h-4 text-blue-500" />}
            {key === 'database' && <Database className="w-4 h-4 text-green-500" />}
            {key === 'agvNetwork' && <Wifi className="w-4 h-4 text-purple-500" />}
            {key === 'sensors' && <Cpu className="w-4 h-4 text-orange-500" />}
            <span className="text-sm font-semibold capitalize">{key}</span>
            <div className={`w-2 h-2 rounded-full ${
              health.status === 'healthy' ? 'bg-green-500' :
              health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>
          <div className="text-xs text-gray-600">
            {key === 'backend' && `${health.responseTime}`}
            {key === 'database' && `${health.connections} connections`}
            {key === 'agvNetwork' && `${health.connected}/${health.total} AGVs`}
            {key === 'sensors' && `${health.active}/${health.total} active`}
          </div>
          <div className="text-xs text-gray-500 mt-1">{health.lastCheck}</div>
        </div>
      ))}
    </div>
  );

  const filteredLogs = logs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Monitoring</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary-500" /> 
          Real-Time Monitoring
        </h1>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Logs
          </button>
          <button className="btn-accent flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary-500" />
          System Health Status
        </h2>
        {renderSystemHealth()}
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => renderKpiTile(kpi, i))}
      </div>

      {/* Real-time Chart */}
      <div className="card-glass">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" /> 
            Pallet Fetch Frequency per Zone
          </h2>
          <div className="flex items-center gap-2">
            <select
              className="input-primary text-sm"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="all">All Zones</option>
              <option value="zone-a">Zone A</option>
              <option value="zone-b">Zone B</option>
              <option value="zone-c">Zone C</option>
            </select>
          </div>
        </div>
        {renderRealTimeChart()}
      </div>

      {/* Animated Status Indicators */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-500" />
          Warehouse Section Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {warehouseSections.map((section, i) => renderStatusIndicator(section, i))}
        </div>
      </div>

      {/* Controls & Log Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="card-glass">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-500" />
            Monitoring Controls
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Real-time Stream</span>
              <button
                onClick={() => setRealtime(!realtime)}
                className={`btn-secondary flex items-center gap-1 ${
                  realtime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {realtime ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {realtime ? 'Active' : 'Paused'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Historical Mode</span>
              <button
                onClick={() => setHistoricalMode(!historicalMode)}
                className={`btn-secondary flex items-center gap-1 ${
                  historicalMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {historicalMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {historicalMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-refresh</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Log Panel */}
        <div className="lg:col-span-2 card-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> 
              Recent Events & Logs
            </h2>
            <select
              className="input-primary text-sm"
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="overflow-y-auto max-h-64">
            <AnimatePresence>
              {filteredLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className={`py-2 flex items-center gap-3 text-sm border-b border-gray-100 last:border-b-0 ${
                    log.level === 'error' ? 'bg-red-50' :
                    log.level === 'warning' ? 'bg-yellow-50' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-xs text-gray-400 w-12 font-mono">{log.time}</span>
                  <span className={`font-semibold ${
                    log.level === 'error' ? 'text-red-500' :
                    log.level === 'warning' ? 'text-yellow-500' : 'text-gray-700'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{log.agvId}</span>
                  <span className="text-gray-700 flex-1">{log.desc}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    log.level === 'error' ? 'bg-red-500' :
                    log.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-glass text-center p-4">
          <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Total Events Today</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">2.3s</div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">98.7%</div>
          <div className="text-sm text-gray-600">System Efficiency</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Active Alerts</div>
        </div>
      </div>
    </div>
  );
} 