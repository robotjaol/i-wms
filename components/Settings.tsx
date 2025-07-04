import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, RefreshCw, Sun, Moon, Database, Save, User, Shield, Bell, Monitor, Palette, Globe, Lock, Key, Wifi, WifiOff, CheckCircle, AlertCircle, Clock, BarChart3, Mail, Volume2, AlertTriangle, FileText, Zap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const [settings, setSettings] = useState({
    // Display & UI
    autoRefresh: true,
    agvOverlay: true,
    darkMode: false,
    compactMode: false,
    showAnimations: true,
    
    // Dashboard
    defaultTimeFilter: 'week',
    defaultDashboard: 'inventory',
    showKPIs: true,
    showCharts: true,
    
    // Database
    dbSource: 'excel',
    autoSync: true,
    syncInterval: 5,
    backupEnabled: true,
    
    // Notifications
    emailNotifications: false,
    pushNotifications: true,
    alertSounds: true,
    lowStockAlerts: true,
    errorAlerts: true,
    
    // Security
    sessionTimeout: 30,
    requireMFA: false,
    auditLogging: true,
    
    // Performance
    cacheEnabled: true,
    dataRetention: 90,
    logLevel: 'info',
  });

  const [userRole, setUserRole] = useState('user');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('i-wms-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('i-wms-settings', JSON.stringify(settings));
      
      setLastSaved(new Date().toLocaleTimeString());
      setHasChanges(false);
      
      // Show success feedback
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        autoRefresh: true,
        agvOverlay: true,
        darkMode: false,
        compactMode: false,
        showAnimations: true,
        defaultTimeFilter: 'week',
        defaultDashboard: 'inventory',
        showKPIs: true,
        showCharts: true,
        dbSource: 'excel',
        autoSync: true,
        syncInterval: 5,
        backupEnabled: true,
        emailNotifications: false,
        pushNotifications: true,
        alertSounds: true,
        lowStockAlerts: true,
        errorAlerts: true,
        sessionTimeout: 30,
        requireMFA: false,
        auditLogging: true,
        cacheEnabled: true,
        dataRetention: 90,
        logLevel: 'info',
      });
    }
  };

  const renderToggleSwitch = (key: string, label: string, description?: string, icon?: any) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        {icon && <icon className="w-5 h-5 text-gray-500" />}
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          {description && <div className="text-sm text-gray-600">{description}</div>}
        </div>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={settings[key as keyof typeof settings] as boolean}
          onChange={(e) => handleSettingChange(key, e.target.checked)}
          className="sr-only"
        />
        <div className={`w-12 h-6 rounded-full transition-colors ${
          settings[key as keyof typeof settings] ? 'bg-primary-500' : 'bg-gray-300'
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </div>
      </div>
    </div>
  );

  const renderSelectSetting = (key: string, label: string, options: { value: string; label: string }[], icon?: any) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        {icon && <icon className="w-5 h-5 text-gray-500" />}
        <div className="font-medium text-gray-900">{label}</div>
      </div>
      <select
        className="input-primary text-sm"
        value={settings[key as keyof typeof settings] as string}
        onChange={(e) => handleSettingChange(key, e.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderNumberSetting = (key: string, label: string, min: number, max: number, step: number, unit: string, icon?: any) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        {icon && <icon className="w-5 h-5 text-gray-500" />}
        <div className="font-medium text-gray-900">{label}</div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          className="input-primary text-sm w-20"
          value={settings[key as keyof typeof settings] as number}
          onChange={(e) => handleSettingChange(key, parseInt(e.target.value))}
        />
        <span className="text-sm text-gray-600">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Settings</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary-500" /> 
          System Configuration
        </h1>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reset to Defaults
          </button>
          <button
            onClick={saveSettings}
            disabled={isSaving || !hasChanges}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Status */}
      {lastSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass border-green-200 bg-green-50"
        >
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Settings saved successfully at {lastSaved}</span>
          </div>
        </motion.div>
      )}

      {/* User Role Management */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" />
          User Role & Permissions
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">Current Role</div>
                <div className="text-sm text-gray-600">Manage your access level</div>
              </div>
            </div>
            <select
              className="input-primary"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display & UI Settings */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-500" />
          Display & User Interface
        </h2>
        <div className="space-y-2">
          {renderToggleSwitch('darkMode', 'Dark Mode', 'Switch between light and dark themes', Moon)}
          {renderToggleSwitch('compactMode', 'Compact Mode', 'Reduce spacing for more content', Monitor)}
          {renderToggleSwitch('showAnimations', 'Show Animations', 'Enable smooth transitions and effects', RefreshCw)}
          {renderToggleSwitch('agvOverlay', 'AGV Overlay', 'Show AGV locations on maps and charts', Globe)}
          {renderToggleSwitch('autoRefresh', 'Auto-refresh Charts', 'Automatically update dashboard data', RefreshCw)}
        </div>
      </div>

      {/* Dashboard Settings */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary-500" />
          Dashboard Configuration
        </h2>
        <div className="space-y-2">
          {renderSelectSetting(
            'defaultTimeFilter',
            'Default Time Filter',
            [
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
            ],
            Clock
          )}
          {renderSelectSetting(
            'defaultDashboard',
            'Default Dashboard',
            [
              { value: 'inventory', label: 'Inventory' },
              { value: 'logistics', label: 'Logistics' },
              { value: 'monitoring', label: 'Monitoring' },
            ],
            Monitor
          )}
          {renderToggleSwitch('showKPIs', 'Show KPI Tiles', 'Display key performance indicators', BarChart3)}
          {renderToggleSwitch('showCharts', 'Show Charts', 'Display data visualizations', BarChart3)}
        </div>
      </div>

      {/* Database Settings */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-500" />
          Database & Data Management
        </h2>
        <div className="space-y-2">
          {renderSelectSetting(
            'dbSource',
            'Preferred DB Source',
            [
              { value: 'excel', label: 'Excel Uploads' },
              { value: 'live', label: 'Live DB Sync' },
              { value: 'hybrid', label: 'Hybrid Mode' },
            ],
            Database
          )}
          {renderToggleSwitch('autoSync', 'Auto Sync', 'Automatically sync with external databases', RefreshCw)}
          {renderNumberSetting('syncInterval', 'Sync Interval', 1, 60, 1, 'minutes', Clock)}
          {renderToggleSwitch('backupEnabled', 'Auto Backup', 'Automatically backup data', Save)}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" />
          Notifications & Alerts
        </h2>
        <div className="space-y-2">
          {renderToggleSwitch('emailNotifications', 'Email Notifications', 'Receive alerts via email', Mail)}
          {renderToggleSwitch('pushNotifications', 'Push Notifications', 'Receive browser notifications', Bell)}
          {renderToggleSwitch('alertSounds', 'Alert Sounds', 'Play sounds for important alerts', Volume2)}
          {renderToggleSwitch('lowStockAlerts', 'Low Stock Alerts', 'Notify when inventory is low', AlertTriangle)}
          {renderToggleSwitch('errorAlerts', 'Error Alerts', 'Notify about system errors', AlertCircle)}
        </div>
      </div>

      {/* Security Settings */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-500" />
          Security & Privacy
        </h2>
        <div className="space-y-2">
          {renderNumberSetting('sessionTimeout', 'Session Timeout', 5, 120, 5, 'minutes', Clock)}
          {renderToggleSwitch('requireMFA', 'Require MFA', 'Enable multi-factor authentication', Key)}
          {renderToggleSwitch('auditLogging', 'Audit Logging', 'Log all user actions for security', FileText)}
        </div>
      </div>

      {/* Performance Settings */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary-500" />
          Performance & Optimization
        </h2>
        <div className="space-y-2">
          {renderToggleSwitch('cacheEnabled', 'Enable Caching', 'Cache data for better performance', Database)}
          {renderNumberSetting('dataRetention', 'Data Retention', 7, 365, 1, 'days', Calendar)}
          {renderSelectSetting(
            'logLevel',
            'Log Level',
            [
              { value: 'debug', label: 'Debug' },
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' },
            ],
            FileText
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary-500" />
          System Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Version</div>
            <div className="text-lg font-semibold">v2.1.0</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Last Updated</div>
            <div className="text-lg font-semibold">2024-07-06</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Database Size</div>
            <div className="text-lg font-semibold">2.3 GB</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Active Users</div>
            <div className="text-lg font-semibold">12</div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary-500" />
          Connection Status
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Backend API</div>
                <div className="text-sm text-gray-600">Connected • 45ms latency</div>
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-gray-600">Connected • 12 active connections</div>
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-medium">AGV Network</div>
                <div className="text-sm text-gray-600">Warning • 8/10 AGVs connected</div>
              </div>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 