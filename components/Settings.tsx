import React, { useState } from 'react';
import { Settings as SettingsIcon, RefreshCw, Sun, Moon, Database, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [agvOverlay, setAgvOverlay] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dbSource, setDbSource] = useState('excel');

  // Persist config (mock)
  const saveConfig = () => {
    // Save to localStorage or backend
    alert('Settings saved!');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Settings</span>
      </nav>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><SettingsIcon className="w-6 h-6 text-primary-500" /> System Settings</h1>
        <button onClick={saveConfig} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
      </div>
      {/* Toggles */}
      <div className="card-glass grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="accent-blue-500 w-5 h-5" />
          <span className="font-medium">Auto-refresh charts</span>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={agvOverlay} onChange={e => setAgvOverlay(e.target.checked)} className="accent-green-500 w-5 h-5" />
          <span className="font-medium">Enable AGV overlay</span>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} className="accent-purple-500 w-5 h-5" />
          <span className="font-medium">Dark mode</span>
        </div>
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary-500" />
          <select value={dbSource} onChange={e => setDbSource(e.target.value)} className="input-primary">
            <option value="excel">Excel Uploads</option>
            <option value="live">Live DB Sync</option>
          </select>
        </div>
      </div>
    </div>
  );
} 