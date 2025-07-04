import React, { useState } from 'react';
import { HelpCircle, AlertCircle, Send, Download, Link as LinkIcon, MessageCircle, FileText, Github, ExternalLink, CheckCircle, Clock, Zap, BookOpen, Video, Phone, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AIAssistant from './AIAssistant';

const faqs = [
  { 
    q: 'How do I upload a new Excel file?', 
    a: 'Go to the Excel Processor tab and drag & drop your file. The system supports .xlsx and .xls formats. Make sure your file follows the required structure with Sheet 4 containing the shift log data.',
    category: 'Getting Started',
    tags: ['upload', 'excel', 'file']
  },
  { 
    q: 'How do I request a restock?', 
    a: 'Use the Inventory tab and click the "Request Restock" button. You can specify the material, quantity, and priority level. The system will automatically notify the warehouse manager.',
    category: 'Inventory',
    tags: ['restock', 'inventory', 'request']
  },
  { 
    q: 'How do I contact support?', 
    a: 'Fill out the support request form below or use the AI Assistant chat. For urgent issues, you can also create a GitHub issue or contact the system administrator.',
    category: 'Support',
    tags: ['contact', 'support', 'help']
  },
  { 
    q: 'What do the different AGV status colors mean?', 
    a: 'Green: Active and operational, Blue: Idle/standby, Red: Maintenance or error, Yellow: Warning or low battery. You can view detailed status in the Logistics tab.',
    category: 'Monitoring',
    tags: ['agv', 'status', 'colors']
  },
  { 
    q: 'How do I export data from the database?', 
    a: 'Go to the Database tab and use the "Export JSON" button. You can also select specific records and export only those. The system supports JSON and CSV formats.',
    category: 'Database',
    tags: ['export', 'data', 'json']
  },
  { 
    q: 'What are the system requirements?', 
    a: 'Modern web browser (Chrome, Firefox, Safari, Edge), stable internet connection, and appropriate user permissions. The system works best on desktop devices.',
    category: 'Technical',
    tags: ['requirements', 'browser', 'permissions']
  },
];

const exampleQueries = [
  "Show me the current inventory levels for Zone A",
  "What was the AGV performance yesterday?",
  "How do I troubleshoot a pallet scanning error?",
  "Generate a report for last week's operations",
  "What are the most common error codes?",
  "How do I configure database sync settings?",
];

const supportCategories = [
  'General Inquiry',
  'Bug Report',
  'Feature Request',
  'Technical Issue',
  'User Training',
  'System Configuration',
  'Data Import/Export',
  'Performance Issue',
];

export default function HelpSupport() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('General Inquiry');
  const [supportMessage, setSupportMessage] = useState('');
  const [showAiChat, setShowAiChat] = useState(false);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState('all');

  const systemStatus = {
    backend: { status: 'healthy', lastUpdate: '2 min ago', responseTime: '45ms' },
    database: { status: 'healthy', lastUpdate: '5 min ago', connections: 12 },
    agvNetwork: { status: 'warning', lastUpdate: '1 min ago', connected: 8 },
    sensors: { status: 'healthy', lastUpdate: '30 sec ago', active: 156 },
  };

  const filteredFaqs = faqs.filter(faq => 
    selectedFaqCategory === 'all' || faq.category === selectedFaqCategory
  );

  const faqCategories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const renderSystemStatus = () => (
    <div className="card-glass border-green-200 bg-green-50">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <div>
          <div className="font-semibold text-sm">System Status: <span className="text-green-700">All systems operational</span></div>
          <div className="text-xs text-gray-700">Last update: 2 min ago • Known issues: 0</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(systemStatus).map(([key, status]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              status.status === 'healthy' ? 'bg-green-500' :
              status.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="font-medium capitalize">{key}</span>
            <span className="text-gray-600">{status.lastUpdate}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFaqSection = () => (
    <div className="card-glass">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-500" /> 
          Frequently Asked Questions
        </h2>
        <select
          className="input-primary text-sm"
          value={selectedFaqCategory}
          onChange={(e) => setSelectedFaqCategory(e.target.value)}
        >
          {faqCategories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-3">
        {filteredFaqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{faq.q}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {faq.category}
                    </span>
                    {faq.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-400 text-lg ml-4">
                  {openFaq === i ? '−' : '+'}
                </span>
              </div>
            </button>
            {openFaq === i && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 text-gray-700 text-sm border-t border-gray-100"
              >
                {faq.a}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAiChat = () => (
    <div className="card-glass">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary-500" /> 
          AI Assistant
        </h2>
        <button
          onClick={() => setShowAiChat(!showAiChat)}
          className="btn-secondary btn-sm flex items-center gap-1"
        >
          {showAiChat ? 'Hide Chat' : 'Show Chat'}
        </button>
      </div>
      
      {showAiChat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <AIAssistant />
        </motion.div>
      )}
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Example Queries:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleQueries.map((query, i) => (
            <div
              key={i}
              className="text-xs p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                setShowAiChat(true);
                // In a real implementation, this would populate the chat input
              }}
            >
              "{query}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSupportForm = () => (
    <div className="card-glass">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-primary-500" /> 
        Support Request Form
      </h2>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="input-primary"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {supportCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <div className="flex gap-2">
            {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
              <label key={priority} className="flex items-center gap-1">
                <input type="radio" name="priority" value={priority} className="text-primary-500" />
                <span className="text-sm">{priority}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            className="input-primary"
            placeholder="Brief description of your issue..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            className="input-primary"
            rows={4}
            placeholder="Please describe your issue or question in detail..."
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Screenshot (optional)</label>
          <input
            type="file"
            className="input-primary"
            accept="image/*"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a screenshot to help us understand your issue better
          </p>
        </div>
        
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" /> Submit Request
          </button>
          <button type="button" className="btn-secondary">
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );

  const renderResources = () => (
    <div className="card-glass">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary-500" /> 
        Resources & Documentation
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <a
            href="https://github.com/your-org/your-repo/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Github className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">GitHub Issues</div>
              <div className="text-sm text-gray-600">Report bugs and request features</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
          
          <a
            href="#"
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">User Manual</div>
              <div className="text-sm text-gray-600">Complete system documentation</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
          
          <a
            href="#"
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Video className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">Video Tutorials</div>
              <div className="text-sm text-gray-600">Step-by-step guides</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
          </a>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Phone className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">Phone Support</div>
              <div className="text-sm text-gray-600">+1 (555) 123-4567</div>
              <div className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">Live Chat</div>
              <div className="text-sm text-gray-600">Available 24/7</div>
              <div className="text-xs text-gray-500">Average response: 2 min</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Zap className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium">System Status</div>
              <div className="text-sm text-green-600">All systems operational</div>
              <div className="text-xs text-gray-500">99.9% uptime this month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Help & Support</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary-500" /> 
          Help & Support Center
        </h1>
        <div className="flex gap-2">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Manual
          </button>
          <button className="btn-accent flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact Support
          </button>
        </div>
      </div>

      {/* System Status Banner */}
      {renderSystemStatus()}

      {/* FAQ Section */}
      {renderFaqSection()}

      {/* AI Chat & Support Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAiChat()}
        {renderSupportForm()}
      </div>

      {/* Resources & Documentation */}
      {renderResources()}

      {/* Quick Actions */}
      <div className="card-glass">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary-500" /> 
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium">View Logs</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-6 h-6 text-green-500" />
            <span className="text-sm font-medium">Export Data</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-6 h-6 text-purple-500" />
            <span className="text-sm font-medium">System Config</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-6 h-6 text-orange-500" />
            <span className="text-sm font-medium">Restart Service</span>
          </button>
        </div>
      </div>
    </div>
  );
} 