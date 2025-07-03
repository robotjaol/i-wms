import React from 'react';
import { BarChart3, Download, Search, Filter, AlertTriangle, Package, Layers, Calendar, Users, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Inventory() {
  // Mock data for charts and table
  const stockData = [
    { category: 'Raw Material', value: 40 },
    { category: 'Packaging', value: 25 },
    { category: 'Finished Goods', value: 35 },
  ];
  const inflowOutflow = [
    { name: 'Mon', inflow: 120, outflow: 80 },
    { name: 'Tue', inflow: 100, outflow: 90 },
    { name: 'Wed', inflow: 140, outflow: 110 },
    { name: 'Thu', inflow: 130, outflow: 120 },
    { name: 'Fri', inflow: 150, outflow: 100 },
  ];
  const alerts = [
    { type: 'Low Stock', message: 'Pallet 1234 (Raw Material) below threshold', level: 'warning' },
    { type: 'Expired', message: 'Batch 5678 expired yesterday', level: 'error' },
    { type: 'Soon Expire', message: 'Batch 9101 expires in 3 days', level: 'warning' },
  ];
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Inventory</span>
      </nav>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Layers className="w-6 h-6 text-primary-500" /> Inventory Dashboard</h1>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
          <button className="btn-accent flex items-center gap-2"><FileSpreadsheet className="w-4 h-4" /> Request Restock</button>
        </div>
      </div>
      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, i) => (
          <div key={i} className={`card flex items-center gap-3 ${alert.level === 'error' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}> 
            <AlertTriangle className={`w-6 h-6 ${alert.level === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
            <div>
              <div className="font-semibold text-sm">{alert.type}</div>
              <div className="text-xs text-gray-700">{alert.message}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-500" /> Stock Distribution</h2>
          <div className="h-56 flex items-center justify-center text-gray-400">[Pie Chart Placeholder]</div>
        </div>
        <div className="card-glass">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-500" /> Inflow/Outflow</h2>
          <div className="h-56 flex items-center justify-center text-gray-400">[Bar Chart Placeholder]</div>
        </div>
      </div>
      {/* Table & Filters */}
      <div className="card-glass mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div className="flex gap-2">
            <input className="input-primary" placeholder="Search PC, Material, Vendor, Batch..." />
            <button className="btn-secondary flex items-center gap-1"><Filter className="w-4 h-4" /> Filter</button>
          </div>
          <button className="btn-accent flex items-center gap-1"><Calendar className="w-4 h-4" /> Timeline View</button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>PC</th><th>Material</th><th>Vendor</th><th>Batch</th><th>Pallet ID</th><th>Qty</th><th>Location</th><th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-blue-50">
                <td>PC-001</td><td>Raw Material</td><td>Vendor A</td><td>Batch 123</td><td>P-1001</td><td>50</td><td>Zone A</td><td>2024-08-01</td>
              </tr>
              <tr className="hover:bg-blue-50">
                <td>PC-002</td><td>Packaging</td><td>Vendor B</td><td>Batch 456</td><td>P-1002</td><td>30</td><td>Zone B</td><td>2024-07-15</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-2">
          <button className="btn-secondary">Mark as Damaged</button>
          <button className="btn-primary">Export CSV</button>
        </div>
      </div>
    </div>
  );
} 