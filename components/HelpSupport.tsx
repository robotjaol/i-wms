import React, { useState } from 'react';
import { HelpCircle, AlertCircle, Send, Download, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import AIAssistant from './AIAssistant';

const faqs = [
  { q: 'How do I upload a new Excel file?', a: 'Go to the Excel Processor tab and drag & drop your file.' },
  { q: 'How do I request a restock?', a: 'Use the Inventory tab and click Request Restock.' },
  { q: 'How do I contact support?', a: 'Fill out the support request form below or use the chat.' },
];

export default function HelpSupport() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-2">
        <span>Home</span> / <span className="text-primary-600 font-semibold">Help & Support</span>
      </nav>
      {/* System Status Banner */}
      <div className="card-glass flex items-center gap-3 bg-green-50 border-green-200">
        <AlertCircle className="w-5 h-5 text-green-500" />
        <div>
          <div className="font-semibold text-sm">System Status: <span className="text-green-700">All systems operational</span></div>
          <div className="text-xs text-gray-700">Last update: 5 min ago</div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="card-glass">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary-500" /> FAQ</h2>
        <ul className="divide-y divide-gray-100">
          {faqs.map((faq, i) => (
            <li key={i} className="py-2">
              <button className="w-full text-left font-medium text-gray-900 flex items-center justify-between" onClick={() => setOpen(open === i ? null : i)}>
                {faq.q}
                <span>{open === i ? '-' : '+'}</span>
              </button>
              {open === i && <div className="mt-2 text-gray-700 text-sm">{faq.a}</div>}
            </li>
          ))}
        </ul>
      </div>
      {/* AI Chat */}
      <div className="card-glass">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><Send className="w-5 h-5 text-primary-500" /> AI Assistant</h2>
        <AIAssistant />
      </div>
      {/* Support Request Form */}
      <div className="card-glass">
        <h2 className="font-semibold mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary-500" /> Support Request</h2>
        <form className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="input-primary">
              <option>General</option>
              <option>Bug Report</option>
              <option>Feature Request</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea className="input-primary" rows={3} placeholder="Describe your issue or question..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Screenshot (optional)</label>
            <input type="file" className="input-primary" />
          </div>
          <button className="btn-primary flex items-center gap-2"><Send className="w-4 h-4" /> Submit</button>
        </form>
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
          <LinkIcon className="w-4 h-4" />
          <a href="https://github.com/your-org/your-repo/issues" target="_blank" rel="noopener noreferrer" className="underline">GitHub Issues</a>
        </div>
      </div>
    </div>
  );
} 