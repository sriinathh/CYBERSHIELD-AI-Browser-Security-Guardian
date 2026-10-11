import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Greetings. I am CyberShield AI Copilot. I analyze your browser telemetry, explain risk scores, investigate suspicious domains, and guide your defensive response. What would you like to explore?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await api.sendCopilotMessage(text, historyPayload);
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.reply || 'Analysis completed with no anomalies.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Advisory: ${err.message || 'Unable to connect to AI security service. Operating under offline rule fallback.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'How does CyberShield compute the URL risk score?',
    'What are homoglyph and punycode attacks?',
    'Explain the difference between heuristics and threat intel.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-full bg-[#08101E] border-l border-cyan-900/40 shadow-2xl flex flex-col slide-in-from-right duration-300">
        {/* Header */}
        <div className="h-16 px-6 border-b border-cyan-900/30 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 to-indigo-950/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                CyberShield Copilot
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">AI</span>
              </h2>
              <p className="text-[10px] text-slate-400">Grounded Security Analyst</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center shrink-0 text-cyan-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div className={`mt-1.5 text-[9px] font-mono ${m.role === 'user' ? 'text-cyan-200 text-right' : 'text-slate-500'}`}>
                  {m.timestamp}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-blue-900 border border-blue-700/60 flex items-center justify-center shrink-0 text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center shrink-0 text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Copilot analyzing telemetry...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-900/60 space-y-1.5">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Suggested Inquiries</p>
          <div className="flex flex-col gap-1">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-left text-[11px] text-cyan-300/80 hover:text-cyan-200 hover:bg-slate-800/50 p-1.5 rounded-lg border border-cyan-900/30 transition truncate"
              >
                ⚡ {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-3 border-t border-cyan-900/30 bg-[#070D19]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot about any threat or URL..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white disabled:opacity-50 hover:from-cyan-500 hover:to-blue-500 transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
