'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

import Link from 'next/link';

type Message = {
  role: 'user' | 'model';
  text: string;
  products?: any[];
};

const formatMarkdownText = (text: string) => {
  let html = text;
  // Headings
  html = html.replace(/^###\s+(.*$)/gim, '<strong class="block mt-3 mb-1 text-[15px] text-zinc-900">$1</strong>');
  html = html.replace(/^##\s+(.*$)/gim, '<strong class="block mt-3 mb-1 text-[16px] text-zinc-900">$1</strong>');
  html = html.replace(/^#\s+(.*$)/gim, '<strong class="block mt-3 mb-1 text-[18px] text-zinc-900">$1</strong>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Math
  html = html.replace(/\$\$(.*?)\$\$/g, '<span class="font-mono text-[#E8002D] bg-red-50 px-1 rounded">$1</span>');
  html = html.replace(/\$(.*?)\$/g, '<span class="font-mono text-[#E8002D] bg-red-50 px-1 rounded">$1</span>');
  
  // Lists
  html = html.replace(/^[\*\-]\s+(.*$)/gim, '<div class="flex gap-2 mt-1"><span class="text-[#E8002D] shrink-0">•</span><span>$1</span></div>');
  
  // Clean up excessive newlines
  html = html.replace(/\n{3,}/g, '\n\n');
  
  // Replace remaining newlines with <br />
  html = html.replace(/\n/g, '<br />');
  
  // Remove <br /> right after block elements so it doesn't cause double spacing
  html = html.replace(/<\/strong><br \/>/g, '</strong>');
  html = html.replace(/<\/div><br \/>/g, '</div>');
  
  return html;
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Xin chào! Mình là PhoneBot, nhân viên tư vấn AI của Phone Store. Mình có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([
    "Cửa hàng ở đâu?",
    "Chính sách bảo hành",
    "Giao hàng bao lâu?"
  ]);

  const handleSend = async (overrideMessage?: string) => {
    const userMessage = (overrideMessage || input).trim();
    if (!userMessage || isLoading) return;

    if (!overrideMessage) setInput('');
    const newHistory: Message[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages // gửi lịch sử chat trước đó
        })
      });

      const data = await res.json();
      let replyText = data.reply || '';
      
      // Parse suggestions [Q1 | Q2 | Q3]
      const match = replyText.match(/\[(.*?)\|(.*?)\|(.*?)\]/);
      if (match) {
        const parsedSuggestions = [match[1].trim(), match[2].trim(), match[3].trim()].filter(Boolean);
        if (parsedSuggestions.length > 0) {
          setCurrentSuggestions(parsedSuggestions);
        }
        replyText = replyText.replace(/\[.*?\|.*?\|.*?\]/g, '').trim();
      }

      setMessages(prev => [...prev, { role: 'model', text: replyText, products: data.products }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra khi kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E8002D] to-[#ff4444] p-4 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                <Bot size={24} className="text-[#E8002D]" />
              </div>
              <div>
                <h3 className="font-bold text-sm">PhoneBot AI</h3>
                <p className="text-xs text-red-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Đang hoạt động
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-[#E8002D]'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div 
                      className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-white border border-zinc-100 text-zinc-800 rounded-tl-sm'
                      }`}
                      dangerouslySetInnerHTML={{ 
                        __html: formatMarkdownText(msg.text)
                      }}
                    />
                    {msg.products && msg.products.length > 0 && (
                      <div className="flex flex-col gap-2 mt-1">
                        {msg.products.map((p, pIdx) => (
                          <Link href={`/product/${p.slug}`} key={pIdx} className="flex items-center gap-3 p-2 bg-white border border-zinc-100 rounded-xl hover:border-red-200 transition-colors shadow-sm group">
                            <img src={p.thumbnail} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-zinc-50" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-zinc-800 truncate group-hover:text-red-600 transition-colors">{p.name}</h4>
                              <p className="text-xs font-semibold text-red-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.baseSalePrice ? p.baseSalePrice : p.basePrice)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-red-100 text-[#E8002D]">
                    <Bot size={16} />
                  </div>
                  <div className="px-4 py-3 bg-white border border-zinc-100 text-zinc-800 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-zinc-400" />
                    <span className="text-xs text-zinc-500 italic">Đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {!isLoading && currentSuggestions.length > 0 && (
            <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-zinc-100">
              {currentSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="px-3 py-1.5 bg-white border border-red-200 text-[#E8002D] rounded-full text-xs hover:bg-red-50 transition-colors shadow-sm shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-zinc-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#E8002D] focus:ring-1 focus:ring-[#E8002D] transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-[#E8002D] text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-[#E8002D] transition-colors"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center mt-2"
        >
          <div className="absolute right-full mr-4 bg-[#E8002D] text-white text-[14px] font-bold px-4 py-2 rounded-lg whitespace-nowrap opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none shadow-lg">
            Chat với AI ngay!
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#E8002D] rotate-45"></div>
          </div>
          
          <div className="absolute inset-0 bg-[#E8002D] rounded-full animate-ping opacity-60"></div>
          <div className="relative w-16 h-16 bg-[#E8002D] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(232,0,45,0.5)] hover:scale-110 transition-transform duration-300 border-[3px] border-white">
            <Bot className="text-white animate-bounce" size={28} />
          </div>
        </button>
      )}
    </div>
  );
}
