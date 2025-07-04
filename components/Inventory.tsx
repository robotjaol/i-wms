import React, { useState } from 'react';
import { BarChart3, Download, Search, Filter, AlertTriangle, Package, Layers, Calendar, Users, FileSpreadsheet, TrendingUp, TrendingDown, MapPin, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveAs } from 'file-saver';

export default function Inventory() {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTimeline, setShowTimeline] = useState(false);

  // Enhanced mock data
  const stockData = [
    { category: 'Raw Material', value: 40, color: '#3B82F6', items: 156 },
    { category: 'Packaging', value: 25, color: '#10B981', items: 89 },
    { category: 'Finished Goods', value: 35, color: '#F59E0B', items: 234 },
  ];

  const inflowOutflow = [
    { name: 'Mon', inflow: 120, outflow: 80, net: 40 },
    { name: 'Tue', inflow: 100, outflow: 90, net: 10 },
    { name: 'Wed', inflow: 140, outflow: 110, net: 30 },
    { name: 'Thu', inflow: 130, outflow: 120, net: 10 },
    { name: 'Fri', inflow: 150, outflow: 100, net: 50 },
    { name: 'Sat', inflow: 80, outflow: 60, net: 20 },
    { name: 'Sun', inflow: 60, outflow: 40, net: 20 },
  ];

  const alerts = [
    { type: 'Low Stock', message: 'Pallet 1234 (Raw Material) below threshold', level: 'warning', count: 5 },
    { type: 'Expired', message: 'Batch 5678 expired yesterday', level: 'error', count: 2 },
    { type: 'Soon Expire', message: 'Batch 9101 expires in 3 days', level: 'warning', count: 8 },
  ];

  const inventoryItems = [
    { pc: 'PC-001', material: 'Raw Material A', vendor: 'Vendor A', batch: 'Batch 123', palletId: 'P-1001', qty: 50, location: 'Zone A', expiry: '2024-08-01', status: 'active' },
    { pc: 'PC-002', material: 'Packaging B', vendor: 'Vendor B', batch: 'Batch 456', palletId: 'P-1002', qty: 30, location: 'Zone B', expiry: '2024-07-15', status: 'low' },
    { pc: 'PC-003', material: 'Finished Goods C', vendor: 'Vendor C', batch: 'Batch 789', palletId: 'P-1003', qty: 75, location: 'Zone C', expiry: '2024-09-01', status: 'active' },
    { pc: 'PC-004', material: 'Raw Material D', vendor: 'Vendor A', batch: 'Batch 101', palletId: 'P-1004', qty: 15, location: 'Zone A', expiry: '2024-07-10', status: 'expired' },
  ];

  const timelineData = [
    { time: '09:00', type: 'inbound', palletId: 'P-2001', from: 'Loading Dock', to: 'Zone A', qty: 25 },
    { time: '10:30', type: 'outbound', palletId: 'P-1001', from: 'Zone A', to: 'Production', qty: 15 },
    { time: '12:15', type: 'inbound', palletId: 'P-2002', from: 'Loading Dock', to: 'Zone B', qty: 30 },
    { time: '14:00', type: 'outbound', palletId: 'P-1002', from: 'Zone B', to: 'Shipping', qty: 20 },
  ];

  // Add time period filtering logic
  const getFilteredData = () => {
    // For demo, just slice data differently
    if (selectedTimePeriod === 'day') {
      return {
        inflowOutflow: inflowOutflow.slice(0, 1),
        inventoryItems: inventoryItems.slice(0, 1),
      };
    } else if (selectedTimePeriod === 'week') {
      return {
        inflowOutflow: inflowOutflow,
        inventoryItems: inventoryItems,
      };
    } else {
      return {
        inflowOutflow: inflowOutflow.concat(inflowOutflow),
        inventoryItems: inventoryItems.concat(inventoryItems),
      };
    }
  };
  const filtered = getFilteredData();

  // Define separate data for each RMS chart
  const rmsAData = stockData.filter(item => item.category === 'Raw Material');
  const rmsBData = stockData.filter(item => item.category === 'Packaging');
  const rmsCData = stockData.filter(item => item.category === 'Finished Goods');

  const renderRMSChart = (
    title: string,
    data: typeof stockData,
    color: string
  ) => (
    <div className="card-glass shadow-lg border border-gray-100 rounded-2xl bg-white/90 flex flex-col min-w-0 w-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold flex items-center gap-2 text-gray-900">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          {title}
        </h2>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          Total: {data.reduce((sum: number, item: typeof stockData[0]) => sum + item.items, 0)} items
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-w-0 w-full">
        <div className="relative h-48 flex items-center justify-center w-full">
          <div className="w-32 h-32 rounded-full border-8 border-gray-200 relative">
            <div className={`absolute inset-0 rounded-full border-8`} style={{ borderColor: color, clipPath: 'polygon(50% 50%, 50% 0%, 90% 0%, 90% 50%)' }}></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 text-xs mt-4">
            {data.map((item: typeof stockData[0], i: number) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-medium shadow-sm">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBarChart = () => (
    <div className="h-56 flex items-end justify-center space-x-2 p-4">
      {filtered.inflowOutflow.map((day, i) => (
        <div key={i} className="flex flex-col items-center space-y-1">
          <div className="flex flex-col space-y-1">
            <div className="w-8 bg-blue-500 rounded-t" style={{ height: `${(day.inflow / 150) * 100}px` }}></div>
            <div className="w-8 bg-red-500 rounded-t" style={{ height: `${(day.outflow / 150) * 100}px` }}></div>
          </div>
          <span className="text-xs text-gray-700">{day.name}</span>
        </div>
      ))}
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-3">
      {timelineData.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-3 p-3 rounded-lg ${
            item.type === 'inbound' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${item.type === 'inbound' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          <span className="text-sm font-mono text-gray-800 w-16">{item.time}</span>
          <span className={`text-sm font-bold ${item.type === 'inbound' ? 'text-green-700' : 'text-blue-700'}`}>{item.type.toUpperCase()}</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${item.type === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{item.palletId}</span>
          <span className="text-sm text-gray-700">{item.from} → {item.to}</span>
          <span className="text-sm font-semibold text-gray-900">Qty: {item.qty}</span>
        </motion.div>
      ))}
    </div>
  );

  // CSV Export function
  function exportCSV() {
    const header = ['PC','Material Description','Vendor','Batch','Pallet ID','Quantity','Location','Expiry Date','Status'];
    const rows = filtered.inventoryItems.map(item => [item.pc, item.material, item.vendor, item.batch, item.palletId, item.qty, item.location, item.expiry, item.status]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'inventory.csv');
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Inventory</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary-500" /> 
          Stock Management Dashboard
        </h1>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary-400">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="btn-accent flex items-center gap-2" onClick={() => alert('Restock request sent!')}>
            <FileSpreadsheet className="w-4 h-4" /> Request Restock
          </button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-2">
        {['day', 'week', 'month'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedTimePeriod(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
              selectedTimePeriod === period
                ? 'bg-primary-500 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Enhanced Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card-glass flex items-center gap-3 ${
              alert.level === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <div className={`p-2 rounded-full ${alert.level === 'error' ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <AlertTriangle className={`w-5 h-5 ${alert.level === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm flex items-center gap-2 text-gray-800">
                {alert.type}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  alert.level === 'error' ? 'bg-red-200 text-red-700' : 'bg-yellow-200 text-yellow-700'
                }`}>
                  {alert.count}
                </span>
              </div>
              <div className="text-xs text-gray-700">{alert.message}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      {/* Inflow/Outflow Chart */}
      <div className="card-glass shadow-lg border border-gray-100 rounded-2xl bg-white/90 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            Inflow/Outflow Trend
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-blue-800 font-semibold">Inflow</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-red-800 font-semibold">Outflow</span>
            </div>
          </div>
        </div>
        {renderBarChart()}
      </div>

      {/* RMS Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderRMSChart('CHART RMS A', rmsAData, '#3B82F6')}
        {renderRMSChart('CHART RMS B', rmsBData, '#10B981')}
        {renderRMSChart('CHART RMS C', rmsCData, '#F59E0B')}
      </div>

      {/* Interactive Filters */}
      <div className="card-glass shadow-lg border border-gray-100 rounded-2xl bg-white/90">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input-primary pl-10"
                placeholder="Search PC, Material Description, Vendor, Batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-primary bg-white text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="raw">Raw Material</option>
              <option value="packaging">Packaging</option>
              <option value="finished">Finished Goods</option>
            </select>
            <button className="btn-secondary flex items-center gap-1">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="btn-accent flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" /> 
            {showTimeline ? 'Hide' : 'Show'} Timeline
          </button>
        </div>

        {/* Timeline View */}
        {showTimeline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-50 rounded-lg"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
              <Clock className="w-4 h-4 text-primary-500" />
              Inbound vs Outbound Activity
            </h3>
            {renderTimeline()}
          </motion.div>
        )}

        {/* Enhanced Table */}
        <div className="overflow-x-auto w-full">
          <table className="table">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">PC</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Material Description</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Vendor</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Batch</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Pallet ID</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Quantity</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Location</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Expiry Date</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Status</th>
                <th className="text-left text-xs font-semibold text-gray-800 uppercase tracking-wider py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.inventoryItems.map((item, i) => (
                <tr key={i} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="font-mono text-sm text-gray-800">{item.pc}</td>
                  <td className="font-medium text-gray-800">{item.material}</td>
                  <td className="text-gray-700">{item.vendor}</td>
                  <td className="font-mono text-sm text-gray-700">{item.batch}</td>
                  <td className="font-mono text-sm text-gray-700">{item.palletId}</td>
                  <td>
                    <span className={`font-semibold ${
                      item.qty < 20 ? 'text-red-600' : item.qty < 50 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {item.qty}
                    </span>
                  </td>
                  <td className="flex items-center gap-1 text-gray-700">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {item.location}
                  </td>
                  <td className={`font-mono text-sm ${
                    new Date(item.expiry) < new Date() ? 'text-red-600' : 
                    new Date(item.expiry) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {item.expiry}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'active' ? 'bg-green-100 text-green-700' :
                      item.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-secondary btn-xs">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button className="btn-secondary btn-xs">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button className="btn-secondary btn-xs">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button className="btn-secondary flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Mark as Damaged
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary-400">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="btn-accent flex items-center gap-2" onClick={() => alert('Restock request sent!')}>
            <FileSpreadsheet className="w-4 h-4" /> Request Restock
          </button>
        </div>
      </div>
    </div>
  );
} 