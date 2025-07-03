'use client';

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
  Activity,
  Database,
  Shield,
  HelpCircle,
  X,
  Menu
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from './SessionContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-cyan-500', description: 'Overview and KPIs' },
  { id: 'excel', label: 'Excel Processor', icon: FileSpreadsheet, color: 'from-green-500 to-emerald-500', description: 'Upload and analyze files' },
  { id: 'ai', label: 'AI Assistant', icon: Bot, color: 'from-purple-500 to-pink-500', description: 'Get AI-powered insights' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-orange-500 to-red-500', description: 'Advanced data analysis' },
];

const systemItems = [
  { id: 'inventory', label: 'Inventory', icon: Package, color: 'from-indigo-500 to-purple-500', description: 'Stock management' },
  { id: 'logistics', label: 'Logistics', icon: Truck, color: 'from-teal-500 to-cyan-500', description: 'Supply chain tracking' },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, color: 'from-yellow-500 to-orange-500', description: 'Real-time monitoring' },
  { id: 'database', label: 'Database', icon: Database, color: 'from-gray-500 to-slate-500', description: 'Data management' },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { session } = useSession();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) {
      onClose();
    }
  };

  const sidebarVariants = {
    closed: { x: '-100%' },
    open: { x: 0 }
  };

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  };

  const visibleTabs = session?.role === 'supervisor'
    ? menuItems
    : menuItems.filter(tab => tab.id === 'excel');

  return (
    <>
      {/* Overlay for all devices */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 200,
          duration: 0.3
        }}
        className={`fixed lg:relative lg:translate-x-0 z-50 h-full w-80 max-w-[85vw] lg:max-w-none bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-xl lg:shadow-lg`}
        role="navigation"
        aria-label="Main navigation"
        style={{ left: 0, top: 0 }}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button for all devices */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">i-WMS</h2>
                  <p className="text-xs text-gray-500">v2.0.0</p>
                </div>
              </div>
              {/* Hamburger button in sidebar header */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close navigation"
              >
                <Menu className="w-6 h-6 text-primary-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Main Menu */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Main Menu
              </h3>
              <div className="space-y-1">
                {visibleTabs.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-current={activeTab === item.id ? 'page' : undefined}
                    aria-describedby={`${item.id}-description`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === item.id
                        ? 'bg-white/20'
                        : 'bg-gradient-to-r ' + item.color + ' text-white'
                    }`}>
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block truncate">{item.label}</span>
                      <span 
                        id={`${item.id}-description`}
                        className={`text-xs block truncate ${
                          activeTab === item.id ? 'text-white/80' : 'text-gray-500'
                        }`}
                      >
                        {item.description}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* System Menu */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                System
              </h3>
              <div className="space-y-1">
                {systemItems.map((item) => (
                  <motion.button
                    key={item.id}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group text-gray-700 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-describedby={`${item.id}-description`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${item.color} text-white`}>
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block truncate">{item.label}</span>
                      <span 
                        id={`${item.id}-description`}
                        className="text-xs text-gray-500 block truncate"
                      >
                        {item.description}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Support Menu */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                Support
              </h3>
              <div className="space-y-1">
                <motion.button
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group text-gray-700 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">Help & Support</span>
                    <span className="text-xs text-gray-500 block truncate">Get assistance</span>
                  </div>
                </motion.button>
                <motion.button
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group text-gray-700 hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-gray-500 to-slate-500 text-white">
                    <Settings className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">Settings</span>
                    <span className="text-xs text-gray-500 block truncate">Configure system</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">System Status</p>
                <p className="text-xs text-gray-600 truncate">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
} 