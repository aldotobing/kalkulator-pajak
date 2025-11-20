
import React, { useState, useRef, useEffect } from 'react';
import { AIIcon, X, Send, RefreshCw, Sparkles } from './Icons';
import { generateTaxAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AIWidgetProps {
  contextData: string;
}

export const AIWidget: React.FC<AIWidgetProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Halo! Saya asisten pajak AI Anda. Ada yang bisa saya bantu mengenai perhitungan pajak di layar Anda?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateTaxAdvice(input, contextData);
    
    const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to parse inline styles (Bold, Italic)
  const parseInline = (text: string) => {
    // Bold: **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italic: *text* or _text_
    html = html.replace(/(\*|_)(.*?)\1/g, '<em class="italic">$2</em>');
    return html;
  };

  // Custom Markdown Parser for basic AI formatting
  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    let output = '';
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (trimmed === '') {
        output += '<div class="h-3"></div>';
        return;
      }

      // Headers (###)
      if (trimmed.startsWith('### ')) {
        const content = parseInline(trimmed.substring(4));
        output += `<h3 class="font-bold text-slate-900 mt-4 mb-2 text-sm uppercase tracking-wide">${content}</h3>`;
        return;
      }

      // Headers (##)
      if (trimmed.startsWith('## ')) {
        const content = parseInline(trimmed.substring(3));
        output += `<h3 class="font-bold text-slate-900 mt-4 mb-2 text-base">${content}</h3>`;
        return;
      }
      
      // Lists (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
         const content = parseInline(trimmed.substring(2));
         output += `<div class="flex items-start gap-2.5 ml-1 mb-1.5 group">
            <span class="text-blue-500 mt-1.5 text-[8px] shrink-0">●</span>
            <span class="text-slate-700 leading-relaxed text-sm">${content}</span>
         </div>`;
         return;
      }

      // Numbered Lists
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
         const content = parseInline(numMatch[2]);
         output += `<div class="flex items-start gap-2 ml-1 mb-1.5">
            <span class="text-blue-600 font-bold text-xs mt-0.5 shrink-0 min-w-[14px]">${numMatch[1]}.</span>
            <span class="text-slate-700 leading-relaxed text-sm">${content}</span>
         </div>`;
         return;
      }

      // Standard Text
      output += `<p class="mb-2 text-slate-700 leading-relaxed text-sm">${parseInline(line)}</p>`;
    });

    return output;
  };

  return (
    <div className="no-print">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 border border-white/20 ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
        } text-white flex items-center justify-center group`}
      >
        {isOpen ? <X size={24} /> : <AIIcon size={28} className="group-hover:animate-pulse" />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-28 right-8 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 z-40 transition-all duration-300 origin-bottom-right transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
        } flex flex-col overflow-hidden font-sans`}
        style={{ height: '600px', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg shadow-blue-500/20">
               <AIIcon size={20} className="text-white" />
            </div>
            <div>
               <h3 className="font-bold text-sm leading-tight">Asisten Pajak</h3>
               <span className="text-xs text-slate-400">Powered by Gemini 2.5</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50 scroll-smooth">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] p-4 rounded-2xl text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                }`}
              >
                 {msg.role === 'user' ? (
                   <p className="leading-relaxed">{msg.text}</p>
                 ) : (
                   <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                 )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-3">
                <RefreshCw className="animate-spin text-blue-500" size={18} />
                <span className="text-xs font-medium text-slate-500">Sedang menganalisa...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Tulis pertanyaan..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-200"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
