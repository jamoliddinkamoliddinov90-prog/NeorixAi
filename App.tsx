
import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, User, Sparkles, Terminal, Info, Zap, Globe, MessageSquare } from 'lucide-react';
import { geminiService, AiMode } from './services/gemini';
import { Message, ChatState } from './types';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AiMode>('general');
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        role: 'model',
        text: "Assalomu alaykum! Men Neorix AI man. Sizga qanday yordam bera olaman?",
        timestamp: Date.now(),
      }
    ],
    isLoading: false,
    error: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const changeMode = async (mode: AiMode) => {
    if (activeMode === mode) return;
    
    setActiveMode(mode);
    setChatState(prev => ({
      ...prev,
      isLoading: true,
      messages: [
        ...prev.messages,
        {
          role: 'model',
          text: `Rejim o'zgartirildi: ${getModeName(mode)}. Yangi chat sessiyasi boshlandi.`,
          timestamp: Date.now(),
        }
      ]
    }));
    
    await geminiService.setMode(mode);
    setChatState(prev => ({ ...prev, isLoading: false }));
  };

  const getModeName = (mode: AiMode) => {
    switch (mode) {
      case 'coding': return 'Dasturlash';
      case 'fast': return 'Tezkor Rejim';
      case 'international': return 'Xalqaro';
      default: return 'Yangi Chat';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInput('');

    let fullResponse = '';
    const modelMessagePlaceholder: Message = {
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, modelMessagePlaceholder],
    }));

    try {
      await geminiService.sendMessageStream(input, (chunk) => {
        fullResponse += chunk;
        setChatState(prev => {
          const newMessages = [...prev.messages];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            text: fullResponse,
          };
          return { ...prev, messages: newMessages };
        });
      });
    } catch (err) {
      setChatState(prev => ({
        ...prev,
        error: "Xatolik yuz berdi. Aloqani tekshiring.",
      }));
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const modeColors = {
    general: 'from-sky-500 to-blue-600',
    coding: 'from-emerald-500 to-teal-600',
    fast: 'from-amber-500 to-orange-600',
    international: 'from-purple-500 to-indigo-600',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-1000">
      {/* Background Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000 ${
        activeMode === 'general' ? 'bg-sky-500' : 
        activeMode === 'coding' ? 'bg-emerald-500' : 
        activeMode === 'fast' ? 'bg-amber-500' : 'bg-purple-500'
      }`}></div>

      <div className="relative w-full max-w-6xl h-[90vh] perspective-1000 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 glass rounded-3xl p-6 rotate-y-5 transition-all duration-700 hover:rotate-y-0 hover:translate-x-2 border-r border-white/10">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
            <div className={`p-2 rounded-xl shadow-lg transition-all duration-500 ${modeColors[activeMode]}`}>
              <Cpu className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <h1 className="text-2xl font-orbitron font-bold tracking-tighter text-white">NEORIX</h1>
          </div>

          <nav className="space-y-3">
            <SidebarItem 
              icon={<MessageSquare className="w-5 h-5" />} 
              label="Yangi Chat" 
              active={activeMode === 'general'} 
              onClick={() => changeMode('general')}
            />
            <SidebarItem 
              icon={<Terminal className="w-5 h-5" />} 
              label="Dasturlash" 
              active={activeMode === 'coding'} 
              onClick={() => changeMode('coding')}
            />
            <SidebarItem 
              icon={<Zap className="w-5 h-5" />} 
              label="Tezkor Rejim" 
              active={activeMode === 'fast'} 
              onClick={() => changeMode('fast')}
            />
            <SidebarItem 
              icon={<Globe className="w-5 h-5" />} 
              label="Xalqaro" 
              active={activeMode === 'international'} 
              onClick={() => changeMode('international')}
            />
          </nav>

          <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">JK</div>
              <p className="text-xs font-semibold text-slate-300">Jamoliddin K.</p>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Ushbu AI Jamoliddin Kamoliddinov tomonidan 12.02.2026 yilda yaratilgan.</p>
          </div>
        </aside>

        {/* Chat Main Area */}
        <main className="flex-1 glass rounded-3xl flex flex-col shadow-2xl relative overflow-hidden border border-white/10 transition-all duration-500 transform">
          {/* Header */}
          <header className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full animate-ping absolute inset-0 ${
                  activeMode === 'general' ? 'bg-sky-500' : 
                  activeMode === 'coding' ? 'bg-emerald-500' : 
                  activeMode === 'fast' ? 'bg-amber-500' : 'bg-purple-500'
                }`}></div>
                <div className={`w-3 h-3 rounded-full relative ${
                  activeMode === 'general' ? 'bg-sky-500' : 
                  activeMode === 'coding' ? 'bg-emerald-500' : 
                  activeMode === 'fast' ? 'bg-amber-500' : 'bg-purple-500'
                }`}></div>
              </div>
              <div>
                <h2 className="font-orbitron text-lg font-bold tracking-wider uppercase">{getModeName(activeMode)}</h2>
                <p className="text-[10px] text-slate-400 tracking-[0.3em] font-medium italic">Powered by Neorix Core</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-[10px] bg-white/10 px-2 py-1 rounded border border-white/10 font-mono">v4.0.2-stable</span>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
            {chatState.messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                <div className={`max-w-[90%] md:max-w-[75%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xl transform transition-transform hover:scale-110 ${
                    msg.role === 'user' ? 'bg-sky-600' : 'bg-slate-800 border border-white/10'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Cpu className={`w-5 h-5 ${
                      activeMode === 'coding' ? 'text-emerald-400' : 
                      activeMode === 'fast' ? 'text-amber-400' : 
                      activeMode === 'international' ? 'text-purple-400' : 'text-sky-400'
                    }`} />}
                  </div>
                  <div className={`relative p-5 rounded-2xl shadow-lg border transition-all duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-sky-600 border-sky-500 text-white rounded-tr-none' 
                      : 'bg-slate-900/60 border-white/5 text-slate-200 rounded-tl-none backdrop-blur-sm'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-inter">
                      {msg.text || (idx === chatState.messages.length - 1 && chatState.isLoading && <TypingIndicator mode={activeMode} />)}
                    </div>
                    <span className="text-[9px] opacity-40 mt-2 block text-right font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <footer className="p-6 bg-slate-900/40 border-t border-white/5 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`${getModeName(activeMode)} rejimida savol bering...`}
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-5 pl-7 pr-20 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-slate-100 placeholder:text-slate-600 shadow-inner"
              />
              <button
                onClick={handleSend}
                disabled={chatState.isLoading || !input.trim()}
                className={`absolute right-3 top-3 bottom-3 w-14 flex items-center justify-center rounded-xl transition-all ${
                  chatState.isLoading || !input.trim() 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : `shadow-xl hover:scale-105 active:scale-95 text-white ${modeColors[activeMode]}`
                }`}
              >
                <Send className={`w-6 h-6 ${chatState.isLoading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 transform ${
      active 
        ? 'bg-white/10 text-white border border-white/10 shadow-lg translate-x-1' 
        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 hover:translate-x-1'
    }`}
  >
    <div className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="text-sm font-orbitron font-medium tracking-wide">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>}
  </button>
);

const TypingIndicator: React.FC<{ mode: AiMode }> = ({ mode }) => {
  const colors = {
    general: 'bg-sky-400',
    coding: 'bg-emerald-400',
    fast: 'bg-amber-400',
    international: 'bg-purple-400'
  };
  return (
    <div className="flex gap-2 py-2">
      <div className={`w-2 h-2 ${colors[mode]} rounded-full animate-bounce [animation-duration:0.8s]`}></div>
      <div className={`w-2 h-2 ${colors[mode]} rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]`}></div>
      <div className={`w-2 h-2 ${colors[mode]} rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]`}></div>
    </div>
  );
};

export default App;
