import React, { useState } from 'react';
import { 
  ArrowLeft,
  FileText,
  Sparkles,
  Send,
  Copy,
  Download,
  RefreshCw,
  Clock
} from 'lucide-react';

interface Message {
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export const AIAnalysisPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [message, setMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      content: 'I\'ve analyzed your document. Here\'s what I found:\n\n**Key Insights:**\n• Revenue increased by 24% in Q4\n• Customer satisfaction score: 4.8/5\n• Major growth in enterprise segment\n• Recommendations for Q1 focus areas',
      timestamp: '2:30 PM'
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setMessages([...messages, {
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessage('');
    setIsAnalyzing(true);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Based on your question, here\'s my analysis...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Left side - File Preview */}
      <div className="hidden lg:flex lg:w-1/2 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
        <div className="p-6 border-b border-[var(--border)]">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Files</span>
          </button>
          <h2 className="text-[var(--text-primary)]">Q4 Financial Report.pdf</h2>
          <p className="text-sm text-[var(--text-tertiary)]">2.4 MB</p>
        </div>
        
        <div className="flex-1 p-6 overflow-auto bg-[var(--background)]">
          <div className="bg-[var(--surface)] rounded-xl p-8" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="space-y-4">
              <h3 className="text-[var(--text-primary)]">Executive Summary</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--background)]">
                  <p className="text-sm text-[var(--text-tertiary)] mb-1">Revenue</p>
                  <p className="text-xl text-[var(--text-primary)]">$2.4M</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--background)]">
                  <p className="text-sm text-[var(--text-tertiary)] mb-1">Growth</p>
                  <p className="text-xl text-[var(--text-primary)]">+24%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - AI Analysis Panel */}
      <div className="flex-1 flex flex-col bg-[var(--surface)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <button 
            onClick={onBack}
            className="flex lg:hidden items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[var(--text-primary)]">AI Analysis</h2>
                <p className="text-sm text-[var(--text-tertiary)]">Chat with your document</p>
              </div>
            </div>
            <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-[var(--text-tertiary)]" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap">
              📝 Summarize
            </button>
            <button className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap">
              💡 Key Insights
            </button>
            <button className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap">
              📊 Extract Data
            </button>
            <button className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap">
              🎯 Action Items
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-4 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white'
                      : 'bg-[var(--background)] text-[var(--text-primary)]'
                  }`}
                >
                  {msg.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-sm text-[var(--text-tertiary)]">AI Assistant</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                </div>
                <div className="flex items-center gap-2 mt-2 px-2">
                  <span className="text-xs text-[var(--text-tertiary)]">{msg.timestamp}</span>
                  {msg.type === 'ai' && (
                    <>
                      <button className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                        <Copy className="w-3 h-3" />
                      </button>
                      <button className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                        <Download className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-[var(--background)] p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2563EB] animate-pulse" />
                  <span className="text-sm text-[var(--text-tertiary)]">AI is analyzing...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about this document..."
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2 text-center">
            AI can make mistakes. Verify important information.
          </p>
        </div>

        {/* Analysis History Sidebar (Mobile: Hidden, Desktop: Shown on toggle) */}
        <div className="hidden xl:block absolute right-0 top-0 w-64 h-full border-l border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-[var(--text-primary)] mb-4">Analysis History</h3>
          <div className="space-y-3">
            {[
              { title: 'Full Document Summary', time: '5 hours ago' },
              { title: 'Revenue Analysis', time: '1 day ago' },
              { title: 'Q&A Session', time: '2 days ago' },
            ].map((item, index) => (
              <button
                key={index}
                className="w-full p-3 rounded-lg bg-[var(--background)] hover:bg-[var(--border)] transition-colors text-left"
              >
                <p className="text-sm text-[var(--text-primary)] truncate">{item.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
                  <span className="text-xs text-[var(--text-tertiary)]">{item.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
