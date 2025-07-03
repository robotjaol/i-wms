'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useMediaQuery } from 'react-responsive';
import { useSession } from '@/components/SessionContext';
import { useRouter } from 'next/navigation';

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
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  const { session, logout } = useSession();
  const router = useRouter();

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

  // Add document event for Escape key to close notification dropdown
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowNotifications(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Add Escape key handler for sidebar
  useEffect(() => {
    function handleSidebarKey(e: KeyboardEvent) {
      if (sidebarOpen && e.key === 'Escape') setSidebarOpen(false);
    }
    document.addEventListener('keydown', handleSidebarKey);
    return () => document.removeEventListener('keydown', handleSidebarKey);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    } else if (session.role === 'supervisor') {
      setActiveTab('dashboard');
    } else if (session.role === 'user') {
      setActiveTab('dashboard');
    }
  }, [session, router]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <span className="text-gray-400 text-lg">Loading i-WMS...</span>
      </div>
    );
  }

  // Tabs definition
  const tabs = session?.role === 'user'
    ? [
        { id: 'excel', label: 'Excel Processor', icon: FileSpreadsheet },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      ]
    : [
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
        return session?.role === 'supervisor' ? <AIAssistant /> : <Dashboard />;
      case 'analytics':
        return session?.role === 'supervisor' ? <Analytics /> : <Dashboard />;
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

  // Responsive notification dropdown width
  const notificationDropdownWidth = isMobile ? 'w-[90vw] max-w-xs' : 'w-80';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm z-30 relative w-full">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open navigation menu"
          >
            <Menu className="w-6 h-6 text-primary-500" />
          </button>
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-gray-900 truncate">i-WMS</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <div className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            System Online
          </div>
          <div className="flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <span className="mr-1">{session?.role === 'supervisor' ? 'Supervisor' : 'User'}</span>
          </div>
          <button
            onClick={() => { logout(); router.replace('/login'); }}
            className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white font-semibold shadow-md hover:scale-105 transition-transform border-0 focus:outline-none focus:ring-2 focus:ring-purple-300"
            style={{ minWidth: 90 }}
          >
            Logout
          </button>
        </div>
      </header>
      {/* Sidebar and main content remain unchanged */}
      {/* Sidebar and overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar overlay"
            />
            {/* Sidebar */}
            <motion.div
              key="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-xl"
              style={{ willChange: 'transform' }}
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Header (fixed/static) */}
      {/* Main content area: scrollable if content overflows */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <div className="p-4 sm:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
              className="min-h-[60vh]"
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile tab navigation at the bottom, only on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-gray-200 flex justify-around shadow-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              activeTab === tab.id
                ? 'text-primary-600 border-t-2 border-primary-500 bg-blue-50'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            <tab.icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}