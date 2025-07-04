import React, { useState } from 'react';
import { Truck, Map, BarChart3, Download, Filter, Calendar, Activity, Navigation, Clock, Zap, Target, Route, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Logistics() {
  const [selectedAgv, setSelectedAgv] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [selectedStation, setSelectedStation] = useState('all');

  // Mock AGV data
  const agvData = [
    { id: 'AGV-001', status: 'active', location: 'Zone A', battery: 85, currentTask: 'Fetching Pallet P-1001' },
    { id: 'AGV-002', status: 'idle', location: 'Loading Dock', battery: 92, currentTask: 'Standby' },
    { id: 'AGV-003', status: 'active', location: 'Zone C', battery: 78, currentTask: 'Delivering to RMS B' },
    { id: 'AGV-004', status: 'maintenance', location: 'Service Bay', battery: 45, currentTask: 'Under Maintenance' },
    { id: 'AGV-005', status: 'active', location: 'Zone B', battery: 88, currentTask: 'Scanning Pallet P-1002' },
  ];

  // Mock pallet flow data for Sankey
  const palletFlow = [
    { from: 'Loading Dock', to: 'Scanning Station', value: 45 },
    { from: 'Scanning Station', to: 'RMS A', value: 30 },
    { from: 'Scanning Station', to: 'RMS B', value: 15 },
    { from: 'RMS A', to: 'Zone A', value: 20 },
    { from: 'RMS A', to: 'Zone B', value: 10 },
    { from: 'RMS B', to: 'Zone C', value: 15 },
  ];

  // Mock route timeline data
  const routeTimeline = [
    { agvId: 'AGV-001', route: 'Loading → Zone A', startTime: '09:00', endTime: '09:15', duration: 15, status: 'completed' },
    { agvId: 'AGV-002', route: 'Zone B → RMS A', startTime: '09:30', endTime: '09:45', duration: 15, status: 'completed' },
    { agvId: 'AGV-003', route: 'Zone C → Loading', startTime: '10:00', endTime: '10:20', duration: 20, status: 'in-progress' },
    { agvId: 'AGV-001', route: 'Zone A → RMS B', startTime: '10:15', endTime: '10:25', duration: 10, status: 'completed' },
  ];

  // Mock bottleneck heatmap data
  const bottleneckData = [
    { station: 'Loading Dock', delay: 5, frequency: 12 },
    { station: 'Scanning Station', delay: 8, frequency: 8 },
    { station: 'RMS A', delay: 3, frequency: 15 },
    { station: 'RMS B', delay: 10, frequency: 6 },
    { station: 'Zone A', delay: 2, frequency: 20 },
    { station: 'Zone B', delay: 4, frequency: 10 },
    { station: 'Zone C', delay: 6, frequency: 8 },
  ];

  const renderAgvMap = () => (
    <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
      {/* Warehouse zones */}
      <div className="absolute top-4 left-4 w-16 h-16 bg-green-200 rounded border-2 border-green-400 flex items-center justify-center text-xs font-semibold">
        Loading
      </div>
      <div className="absolute top-4 right-4 w-16 h-16 bg-blue-200 rounded border-2 border-blue-400 flex items-center justify-center text-xs font-semibold">
        Scan
      </div>
      <div className="absolute top-1/2 left-4 w-16 h-16 bg-yellow-200 rounded border-2 border-yellow-400 flex items-center justify-center text-xs font-semibold">
        RMS A
      </div>
      <div className="absolute top-1/2 right-4 w-16 h-16 bg-purple-200 rounded border-2 border-purple-400 flex items-center justify-center text-xs font-semibold">
        RMS B
      </div>
      <div className="absolute bottom-4 left-1/3 w-16 h-16 bg-red-200 rounded border-2 border-red-400 flex items-center justify-center text-xs font-semibold">
        Zone A
      </div>
      <div className="absolute bottom-4 right-1/3 w-16 h-16 bg-orange-200 rounded border-2 border-orange-400 flex items-center justify-center text-xs font-semibold">
        Zone B
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-pink-200 rounded border-2 border-pink-400 flex items-center justify-center text-xs font-semibold">
        Zone C
      </div>

      {/* AGV indicators */}
      {agvData.map((agv, i) => (
        <motion.div
          key={agv.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold ${
            agv.status === 'active' ? 'bg-green-500 animate-pulse' :
            agv.status === 'idle' ? 'bg-blue-500' :
            agv.status === 'maintenance' ? 'bg-red-500' : 'bg-gray-500'
          }`}
          style={{
            top: `${20 + (i * 15)}%`,
            left: `${30 + (i * 10)}%`,
          }}
          title={`${agv.id} - ${agv.currentTask} (${agv.battery}% battery)`}
        >
          {agv.id.split('-')[1]}
        </motion.div>
      ))}
    </div>
  );

  const renderSankeyDiagram = () => (
    <div className="h-64 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Flow lines */}
        {palletFlow.map((flow, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-60"
            style={{
              height: `${flow.value * 2}px`,
              width: '60%',
              left: '20%',
              top: `${20 + (i * 15)}%`,
              transform: 'rotate(45deg)',
            }}
          />
        ))}
        
        {/* Nodes */}
        <div className="absolute top-4 left-4 w-12 h-8 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
          Loading
        </div>
        <div className="absolute top-4 right-4 w-12 h-8 bg-green-500 rounded text-white text-xs flex items-center justify-center">
          Scan
        </div>
        <div className="absolute top-1/2 left-4 w-12 h-8 bg-yellow-500 rounded text-white text-xs flex items-center justify-center">
          RMS A
        </div>
        <div className="absolute top-1/2 right-4 w-12 h-8 bg-purple-500 rounded text-white text-xs flex items-center justify-center">
          RMS B
        </div>
        <div className="absolute bottom-4 left-1/3 w-12 h-8 bg-red-500 rounded text-white text-xs flex items-center justify-center">
          Zone A
        </div>
        <div className="absolute bottom-4 right-1/3 w-12 h-8 bg-orange-500 rounded text-white text-xs flex items-center justify-center">
          Zone B
        </div>
        <div className="absolute bottom-4 right-4 w-12 h-8 bg-pink-500 rounded text-white text-xs flex items-center justify-center">
          Zone C
        </div>
      </div>
    </div>
  );

  const renderTimelineChart = () => (
    <div className="h-56 space-y-2 p-4">
      {routeTimeline.map((route, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-3 p-2 rounded-lg ${
            route.status === 'completed' ? 'bg-green-50 border border-green-200' :
            route.status === 'in-progress' ? 'bg-blue-50 border border-blue-200' :
            'bg-gray-50 border border-gray-200'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${
            route.status === 'completed' ? 'bg-green-500' :
            route.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'
          }`} />
          <span className="text-sm font-mono text-gray-600 w-16">{route.startTime}</span>
          <span className="text-sm font-semibold">{route.agvId}</span>
          <span className="text-sm text-gray-700 flex-1">{route.route}</span>
          <span className="text-sm font-semibold text-gray-800">{route.duration}m</span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            route.status === 'completed' ? 'bg-green-100 text-green-700' :
            route.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {route.status}
          </span>
        </motion.div>
      ))}
    </div>
  );

  const renderHeatmap = () => (
    <div className="h-56 p-4">
      <div className="grid grid-cols-3 gap-2 h-full">
        {bottleneckData.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-lg border"
            style={{
              backgroundColor: `rgba(239, 68, 68, ${item.delay / 10})`,
              borderColor: item.delay > 5 ? '#ef4444' : '#d1d5db'
            }}
          >
            <span className="text-xs font-semibold text-center">{item.station}</span>
            <span className="text-xs text-black">{item.delay}m delay</span>
            <span className="text-xs text-black">{item.frequency}/hr</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Logistics</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary-500" /> 
          Supply Chain Tracking
        </h1>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button className="btn-accent flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live View
          </button>
        </div>
      </div>

      {/* AGV Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {agvData.map((agv, i) => (
          <motion.div
            key={agv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-glass p-3 ${
              agv.status === 'active' ? 'border-green-200 bg-green-50' :
              agv.status === 'idle' ? 'border-blue-200 bg-blue-50' :
              agv.status === 'maintenance' ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                agv.status === 'active' ? 'bg-green-500 animate-pulse' :
                agv.status === 'idle' ? 'bg-blue-500' :
                agv.status === 'maintenance' ? 'bg-red-500' : 'bg-gray-500'
              }`} />
              <span className="text-sm font-semibold">{agv.id}</span>
            </div>
            <div className="text-xs text-gray-600 mb-1">{agv.location}</div>
            <div className="text-xs text-gray-500">{agv.battery}% battery</div>
          </motion.div>
        ))}
      </div>

      {/* Live AGV Map & Sankey Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-white" /> 
              Live AGV Location Mapping
            </h2>
            <div className="text-sm text-gray-500">
              {agvData.filter(agv => agv.status === 'active').length} Active
            </div>
          </div>
          {renderAgvMap()}
        </div>

        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Route className="w-5 h-5 text-white" /> 
              Pallet Flow (Sankey)
            </h2>
            <div className="text-sm text-gray-500">
              {palletFlow.reduce((sum, flow) => sum + flow.value, 0)} pallets/hr
            </div>
          </div>
          {renderSankeyDiagram()}
        </div>
      </div>

      {/* Timeline Chart & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-white" /> 
              Route Timeline
            </h2>
            <div className="text-sm text-gray-500">
              Avg: {Math.round(routeTimeline.reduce((sum, route) => sum + route.duration, 0) / routeTimeline.length)}m
            </div>
          </div>
          {renderTimelineChart()}
        </div>

        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-white" /> 
              Bottleneck Heatmap
            </h2>
            <div className="text-sm text-gray-500">
              Delay intensity
            </div>
          </div>
          {renderHeatmap()}
        </div>
      </div>

      {/* Interactive Filters */}
      <div className="card-glass">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">AGV ID</label>
            <select
              className="input-primary"
              value={selectedAgv}
              onChange={(e) => setSelectedAgv(e.target.value)}
            >
              <option value="all">All AGVs</option>
              {agvData.map(agv => (
                <option key={agv.id} value={agv.id}>{agv.id}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="input-primary"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
            <select
              className="input-primary"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              <option value="all">All Stations</option>
              <option value="loading">Loading Dock</option>
              <option value="scanning">Scanning Station</option>
              <option value="rms-a">RMS A</option>
              <option value="rms-b">RMS B</option>
              <option value="zone-a">Zone A</option>
              <option value="zone-b">Zone B</option>
              <option value="zone-c">Zone C</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="btn-secondary flex items-center gap-1">
              <Filter className="w-4 h-4" /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-glass text-center p-4">
          <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">98.5%</div>
          <div className="text-sm text-gray-600">AGV Uptime</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">12.3</div>
          <div className="text-sm text-gray-600">Avg Pallets/Hour</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">15.2m</div>
          <div className="text-sm text-gray-600">Avg Route Time</div>
        </div>
        
        <div className="card-glass text-center p-4">
          <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Active Routes</div>
        </div>
      </div>
    </div>
  );
} 