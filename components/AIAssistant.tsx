'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw, 
  Download,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  MessageSquare,
  FileText,
  BarChart3,
  TrendingUp,
  Settings,
  X
} from 'lucide-react';
import { queryAI } from '@/lib/ai';
import { useSession } from './SessionContext';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

interface QuickPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: any;
  color: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  // Show quick prompts if there are no messages
  const showQuickPrompts = messages.length === 0;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { session } = useSession();
  const isSupervisor = session?.role === 'supervisor';

  const quickPrompts: QuickPrompt[] = [
    {
      id: '1',
      title: 'Performance Analysis',
      description: 'Analyze warehouse performance metrics',
      prompt: 'Can you analyze the warehouse performance for the last week and identify any bottlenecks or areas for improvement?',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      title: 'Shift Optimization',
      description: 'Optimize shift scheduling and efficiency',
      prompt: 'What are the optimal shift patterns for maximum warehouse efficiency based on current data?',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '3',
      title: 'Equipment Status',
      description: 'Check equipment performance and maintenance',
      prompt: 'What is the current status of all warehouse equipment and are there any maintenance alerts?',
      icon: Settings,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '4',
      title: 'Data Export',
      description: 'Generate reports and export data',
      prompt: 'Can you generate a comprehensive report of today\'s warehouse operations and export it in Excel format?',
      icon: FileText,
      color: 'from-orange-500 to-red-500'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !isSupervisor) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Pass supervisor_mode header
      const aiResponse = await queryAI({ message: content.trim() }, { 'Supervisor-Mode': isSupervisor ? 'true' : 'false' });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: '',
        error: err.message || 'Failed to get AI response',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    handleSendMessage(prompt.prompt);
    // setShowQuickPrompts(false); // This state is now managed by the useEffect hook
  };

  const clearChat = () => {
    setMessages([]);
    // setShowQuickPrompts(true); // This state is now managed by the useEffect hook
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Show temporary success indicator
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Assistant</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportChat}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Export chat"
          >
            <Download className="w-4 h-4 text-gray-600" aria-hidden="true" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Clear chat"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <AnimatePresence>
        {showQuickPrompts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mb-6 p-6 rounded-2xl glass-card shadow-lg flex flex-col items-center text-center"
          >
            <Sparkles className="w-8 h-8 text-purple-400 mb-2" />
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Quick Prompts</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {quickPrompts.map((prompt) => (
                <li key={prompt.id}>
                  <button
                    onClick={() => handleQuickPrompt(prompt)}
                    className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${prompt.color} flex items-center justify-center flex-shrink-0`}>
                        <prompt.icon className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{prompt.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 truncate">{prompt.description}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3">Try clicking a prompt or continue typing your own question!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] sm:max-w-[70%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" aria-hidden="true" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" aria-hidden="true" />
                  )}
                </div>
                
                <div className={`flex-1 min-w-0 ${
                  message.type === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-4 rounded-2xl ${message.type === 'user' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white' : 'bg-white border border-gray-200 text-gray-900'} shadow-md`}>
                        {typeof message.content === 'object'
                          ? (message.content.answer || JSON.stringify(message.content))
                          : message.content}
                      </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is typing...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        {!isSupervisor && (
          <div className="mb-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Only Supervisors can use the AI Assistant. Switch to Supervisor Mode to ask questions.
          </div>
        )}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
              placeholder={isSupervisor ? "Ask about your warehouse data..." : "Supervisor access required"}
              className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500 text-sm text-black"
              rows={1}
              maxLength={1000}
              disabled={isLoading || !isSupervisor}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {inputValue.length}/1000
            </div>
          </div>
          
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading || !isSupervisor}
            className="p-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="flex items-center space-x-1">
            <MessageSquare className="w-3 h-3" aria-hidden="true" />
            <span>{messages.length - 1} messages</span>
          </span>
        </div>
      </div>
    </div>
  );
} 