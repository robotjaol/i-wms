import React from 'react';
import { Database, Download, Upload, Filter, Trash2, RefreshCw, Search, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DatabasePanel() {
  // Mock data for table
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Database</span>
      </nav>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Database className="w-6 h-6 text-primary-500" /> Data Management</h1>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2"><Download className="w-4 h-4" /> Export JSON</button>
          <button className="btn-secondary flex items-center gap-2"><Save className="w-4 h-4" /> Backup</button>
          <button className="btn-accent flex items-center gap-2"><Upload className="w-4 h-4" /> Restore</button>
        </div>
      </div>
      {/* Filters & Sync */}
      <div className="flex gap-2 mb-2">
        <input className="input-primary" placeholder="Search, filter by date, station..." />
        <button className="btn-secondary flex items-center gap-1"><Filter className="w-4 h-4" /> Filter</button>
        <button className="btn-accent flex items-center gap-1"><RefreshCw className="w-4 h-4" /> Sync</button>
      </div>
      {/* Table */}
      <div className="card-glass overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Start Date</th><th>Fetch Station</th><th>Delivery Station</th><th>Batch</th><th>Qty</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-blue-50">
              <td>2024-07-01</td><td>Zone A</td><td>Zone B</td><td>Batch 123</td><td>50</td><td>OK</td>
              <td><button className="btn-secondary btn-xs"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
            <tr className="hover:bg-blue-50">
              <td>2024-07-02</td><td>Zone C</td><td>Zone D</td><td>Batch 456</td><td>30</td><td>OK</td>
              <td><button className="btn-secondary btn-xs"><Trash2 className="w-4 h-4" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-2">
        <button className="btn-secondary">Batch Delete</button>
        <button className="btn-primary">Update Selected</button>
      </div>
    </div>
  );
} 