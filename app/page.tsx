'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Bot, 
  Settings, 
  TrendingUp, 
  Package, 
  Truck, 
  Users,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ExcelProcessor from '@/components/ExcelProcessor';
import AIAssistant from '@/components/AIAssistant';
import Analytics from '@/components/Analytics';
import { Tooltip } from 'react-tooltip';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'System maintenance scheduled at 2AM.' },
    { id: 2, message: 'New shift log uploaded.' },
  ]);
  // System status state
  const [systemOnline, setSystemOnline] = useState(true);
  // Supervisor mode state
  const [supervisorMode, setSupervisorMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('supervisorMode') === 'true';
    }
    return true;
  });
  const notificationRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setHydrated(true);
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Poll backend for system status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/records');
        setSystemOnline(res.ok);
      } catch {
        setSystemOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Persist supervisor mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('supervisorMode', String(supervisorMode));
    }
  }, [supervisorMode]);

  // Close notifications on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
        setUnreadNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <span className="text-gray-400 text-lg">Loading i-WMS...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'excel', label: 'Excel Processor', icon: FileSpreadsheet },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'excel':
        return <ExcelProcessor />;
      case 'ai':
        return <AIAssistant />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  const getCurrentTabInfo = () => {
    return tabs.find(tab => tab.id === activeTab) || tabs[0];
  };

  // Tooltip content for system status
  const statusTooltip = systemOnline
    ? 'All systems operational'
    : 'Backend unreachable';
  // Tooltip content for supervisor mode
  const supervisorTooltip = supervisorMode
    ? 'Switch to User Mode'
    : 'Switch to Supervisor Mode';

  // Notification type coloring (demo)
  const notificationType = (msg: string) => {
    if (msg.toLowerCase().includes('maintenance')) return 'bg-yellow-100 text-yellow-800';
    if (msg.toLowerCase().includes('error')) return 'bg-red-100 text-red-800';
    if (msg.toLowerCase().includes('uploaded')) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sidebarOpen}
        >
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-gray-700" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen || !isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and current tab */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">i-WMS</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Intelligent Warehouse Management System</p>
                </div>
              </div>
              
              {/* Mobile current tab indicator */}
              <div className="lg:hidden flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  {(() => {
                    const IconComponent = getCurrentTabInfo().icon;
                    return <IconComponent className="w-4 h-4 text-white" aria-hidden="true" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{getCurrentTabInfo().label}</h2>
                </div>
              </div>
            </div>
            
            {/* Right side - Status and actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search button for mobile */}
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500">
                <Search className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <span className="sr-only">Search</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  ref={notificationRef}
                  className="relative p-2 rounded-lg bg-gradient-to-tr from-pink-100 to-blue-100 shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all duration-200"
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => {
                    setShowNotifications((v) => !v);
                    setUnreadNotifications(false);
                  }}
                  aria-label="Notifications"
                >
                  <motion.span
                    initial={{ rotate: 0 }}
                    animate={{ rotate: showNotifications ? -20 : 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Bell className="w-5 h-5 text-primary-500" aria-hidden="true" />
                  </motion.span>
                  <span className="sr-only">Notifications</span>
                  {unreadNotifications && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-lg animate-pulse"></span>
                  )}
                </motion.button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.25 }}
                      className="absolute right-0 mt-2 w-80 bg-gradient-to-br from-white via-blue-50 to-pink-50 rounded-2xl shadow-2xl border border-blue-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b font-semibold text-gray-900 bg-gradient-to-r from-blue-100 to-pink-100">Notifications</div>
                      <ul className="max-h-60 overflow-y-auto divide-y divide-blue-50">
                        {notifications.length === 0 ? (
                          <li className="p-4 text-gray-400 text-sm">No notifications</li>
                        ) : (
                          notifications.map((n) => (
                            <li key={n.id} className={`p-4 text-sm font-medium flex items-center gap-2 hover:bg-blue-50 transition-colors ${notificationType(n.message)} animate-fade-in`}>
                              <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-tr from-primary-400 to-accent-400 mr-2"></span>
                              {n.message}
                            </li>
                          ))
                        )}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* System status */}
              <div className="hidden sm:flex items-center space-x-2 text-sm font-semibold px-3 py-1 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 shadow hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
                data-tooltip-id="system-status-tooltip"
                data-tooltip-content={statusTooltip}
              >
                <motion.div
                  className={`w-2.5 h-2.5 rounded-full shadow-lg ${systemOnline ? 'bg-success-500' : 'bg-red-500'}`}
                  animate={{ scale: [1, 1.3, 1], boxShadow: systemOnline ? '0 0 8px #22c55e' : '0 0 8px #ef4444' }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
                <span className={`transition-colors duration-200 ${systemOnline ? 'text-success-700' : 'text-red-700'}`}>{systemOnline ? 'System Online' : 'System Offline'}</span>
                <Tooltip id="system-status-tooltip" />
              </div>

              {/* User info / Supervisor Mode toggle */}
              <motion.button
                className={`hidden md:flex items-center space-x-2 text-sm font-semibold px-3 py-1 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 shadow hover:shadow-lg transition-all duration-200 focus:outline-none ${supervisorMode ? 'ring-2 ring-purple-400' : 'ring-2 ring-blue-400'}`}
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.07 }}
                onClick={() => setSupervisorMode((v) => !v)}
                aria-label="Toggle Supervisor Mode"
                data-tooltip-id="supervisor-mode-tooltip"
                data-tooltip-content={supervisorTooltip}
              >
                <Users className={`w-4 h-4 ${supervisorMode ? 'text-purple-600' : 'text-blue-600'}`} aria-hidden="true" />
                <span className={supervisorMode ? 'text-purple-700' : 'text-blue-700'}>{supervisorMode ? 'Supervisor Mode' : 'User Mode'}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${supervisorMode ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'}`}>{supervisorMode ? 'S' : 'U'}</span>
                <Tooltip id="supervisor-mode-tooltip" />
              </motion.button>

              {/* Mobile status indicator */}
              <div className="sm:hidden flex items-center space-x-2 px-2 py-1 rounded-lg bg-gradient-to-r from-green-100 to-blue-100 shadow">
                <motion.div
                  className={`w-2.5 h-2.5 rounded-full ${systemOnline ? 'bg-success-500' : 'bg-red-500'}`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
                <span className={`text-xs font-semibold ${systemOnline ? 'text-success-700' : 'text-red-700'}`}>{systemOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          {/* Mobile tab navigation */}
          <div className="lg:hidden mt-4">
            <nav className="flex space-x-1" role="tablist" aria-label="Main navigation">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-4 sm:p-6 pb-24 lg:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                className="h-full"
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile bottom navigation for very small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <nav className="flex justify-around py-2" role="tablist" aria-label="Bottom navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                activeTab === tab.id
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <tab.icon className="w-5 h-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
} 