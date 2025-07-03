import React from 'react';
import { Truck, Map, BarChart3, Download, Filter, Calendar, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Logistics() {
  // Mock data for AGV and flows
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Logistics</span>
      </nav>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Truck className="w-6 h-6 text-primary-500" /> Logistics & Supply Chain</h1>
        <button className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" /> Export Data</button>
      </div>
      {/* AGV Map & Sankey */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass h-64 flex flex-col items-center justify-center">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Map className="w-5 h-5 text-primary-500" /> Live AGV Map</h2>
          <div className="flex-1 flex items-center justify-center text-gray-400">[AGV Map Placeholder]</div>
        </div>
        <div className="card-glass h-64 flex flex-col items-center justify-center">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-500" /> Pallet Flow (Sankey)</h2>
          <div className="flex-1 flex items-center justify-center text-gray-400">[Sankey Diagram Placeholder]</div>
        </div>
      </div>
      {/* Timeline & Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass h-56 flex flex-col items-center justify-center">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="w-5 h-5 text-primary-500" /> Route Timeline</h2>
          <div className="flex-1 flex items-center justify-center text-gray-400">[Timeline Chart Placeholder]</div>
        </div>
        <div className="card-glass h-56 flex flex-col items-center justify-center">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-primary-500" /> Bottleneck Heatmap</h2>
          <div className="flex-1 flex items-center justify-center text-gray-400">[Heatmap Placeholder]</div>
        </div>
      </div>
      {/* Filters */}
      <div className="flex gap-2 mt-4">
        <input className="input-primary" placeholder="Filter by AGV ID, location..." />
        <button className="btn-secondary flex items-center gap-1"><Filter className="w-4 h-4" /> Filter</button>
      </div>
    </div>
  );
} 