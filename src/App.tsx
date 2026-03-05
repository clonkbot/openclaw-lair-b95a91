import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
  message: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

// Utility components
const GlitchText: React.FC<{ children: string; className?: string }> = ({ children, className = '' }) => (
  <span className={`relative inline-block ${className}`}>
    <span className="relative z-10">{children}</span>
    <span className="absolute top-0 left-0 text-[#00ff88] opacity-70 animate-glitch-1 z-0" aria-hidden="true">{children}</span>
    <span className="absolute top-0 left-0 text-[#bf00ff] opacity-70 animate-glitch-2 z-0" aria-hidden="true">{children}</span>
  </span>
);

const ScanLine: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
    <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent animate-scan" />
  </div>
);

const KaijuPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={`absolute opacity-5 ${className}`} viewBox="0 0 100 100" fill="none">
    <path d="M50 0 L60 30 L100 35 L70 55 L80 100 L50 75 L20 100 L30 55 L0 35 L40 30 Z" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 4" />
  </svg>
);

// Status Panel Component
const StatusPanel: React.FC<{ status: 'online' | 'processing' | 'idle' | 'error' }> = ({ status }) => {
  const statusConfig = {
    online: { color: '#00ff88', label: 'ONLINE', pulse: true },
    processing: { color: '#bf00ff', label: 'PROCESSING', pulse: true },
    idle: { color: '#666', label: 'IDLE', pulse: false },
    error: { color: '#ff3366', label: 'ERROR', pulse: true },
  };

  const config = statusConfig[status];

  const stats = [
    { label: 'NEURAL LOAD', value: '47%', bar: 47 },
    { label: 'MEMORY BANKS', value: '2.4GB', bar: 62 },
    { label: 'SYNC RATE', value: '99.7%', bar: 99 },
    { label: 'THREAT LEVEL', value: 'LOW', bar: 15 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative bg-black/60 backdrop-blur-sm border border-[#00ff88]/20 rounded-sm overflow-hidden"
    >
      <KaijuPattern className="w-32 h-32 text-[#00ff88] -top-10 -right-10" />

      {/* Header */}
      <div className="relative px-4 md:px-6 py-3 md:py-4 border-b border-[#00ff88]/20 flex items-center justify-between">
        <h2 className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-[#00ff88]/70">SYSTEM STATUS</h2>
        <div className="flex items-center gap-2 md:gap-3">
          <span className="font-mono text-[10px] md:text-xs" style={{ color: config.color }}>{config.label}</span>
          <motion.div
            className="w-2 h-2 md:w-3 md:h-3 rounded-full"
            style={{ backgroundColor: config.color }}
            animate={config.pulse ? { scale: [1, 1.2, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <span className="font-mono text-[10px] md:text-xs text-gray-500 tracking-wider">{stat.label}</span>
              <span className="font-mono text-xs md:text-sm text-[#00ff88]">{stat.value}</span>
            </div>
            <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #00ff88, #bf00ff)` }}
                initial={{ width: 0 }}
                animate={{ width: `${stat.bar}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Kaiju Silhouette */}
      <div className="absolute bottom-0 right-0 w-24 md:w-32 h-24 md:h-32 opacity-10">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-[#00ff88]">
          <path d="M30 90 L35 70 L25 50 L40 55 L50 30 L55 45 L70 40 L65 55 L80 60 L70 70 L75 90 Z" />
          <circle cx="50" cy="35" r="3" />
        </svg>
      </div>
    </motion.div>
  );
};

// Activity Log Component
const ActivityLog: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const typeColors = {
    info: 'text-gray-400',
    success: 'text-[#00ff88]',
    warning: 'text-yellow-500',
    error: 'text-[#ff3366]',
    command: 'text-[#bf00ff]',
  };

  const typeIcons = {
    info: '[i]',
    success: '[+]',
    warning: '[!]',
    error: '[x]',
    command: '[>]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative bg-black/60 backdrop-blur-sm border border-[#bf00ff]/20 rounded-sm overflow-hidden h-full flex flex-col"
    >
      <KaijuPattern className="w-24 h-24 text-[#bf00ff] -bottom-8 -left-8" />

      {/* Header */}
      <div className="relative px-4 md:px-6 py-3 md:py-4 border-b border-[#bf00ff]/20 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#bf00ff] animate-pulse" />
        <h2 className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-[#bf00ff]/70">ACTIVITY LOG</h2>
      </div>

      {/* Log Entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 md:space-y-2 scrollbar-thin min-h-0">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[10px] md:text-xs leading-relaxed flex gap-2 md:gap-3"
            >
              <span className="text-gray-600 shrink-0">
                {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
              </span>
              <span className={`shrink-0 ${typeColors[log.type]}`}>{typeIcons[log.type]}</span>
              <span className="text-gray-300 break-all">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Command Chat Component
const CommandChat: React.FC<{
  messages: ChatMessage[];
  onSend: (msg: string) => void;
}> = ({ messages, onSend }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative bg-black/60 backdrop-blur-sm border border-[#00ff88]/20 rounded-sm overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="relative px-4 md:px-6 py-3 md:py-4 border-b border-[#00ff88]/20 flex items-center justify-between">
        <h2 className="font-mono text-[10px] md:text-xs tracking-[0.3em] text-[#00ff88]/70">COMMAND INTERFACE</h2>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] md:text-[10px] text-gray-600">ENCRYPTED</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scrollbar-thin min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[80%] px-3 md:px-4 py-2 md:py-3 rounded-sm ${
                  msg.role === 'user'
                    ? 'bg-[#bf00ff]/20 border border-[#bf00ff]/30 text-[#bf00ff]'
                    : 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]'
                }`}
              >
                <div className="font-mono text-[10px] md:text-xs mb-1 opacity-50">
                  {msg.role === 'user' ? 'OPERATOR' : 'OPENCLAW'}
                </div>
                <div className="font-mono text-xs md:text-sm leading-relaxed">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t border-[#00ff88]/20">
        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command..."
            className="flex-1 bg-black/50 border border-[#00ff88]/30 rounded-sm px-3 md:px-4 py-2.5 md:py-2 font-mono text-xs md:text-sm text-[#00ff88] placeholder-gray-600 focus:outline-none focus:border-[#00ff88]/60 transition-colors"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 md:px-6 py-2.5 md:py-2 bg-[#00ff88]/20 border border-[#00ff88]/50 rounded-sm font-mono text-xs text-[#00ff88] hover:bg-[#00ff88]/30 transition-colors min-w-[60px]"
          >
            SEND
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// Main App
export default function App() {
  const [status, setStatus] = useState<'online' | 'processing' | 'idle' | 'error'>('online');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'agent',
      content: 'OpenClaw neural network initialized. Awaiting commands, operator.',
      timestamp: new Date(),
    },
  ]);

  // Simulate activity
  useEffect(() => {
    const logMessages = [
      { type: 'info' as const, message: 'Scanning network perimeter...' },
      { type: 'success' as const, message: 'Connection established to @clawzilla_app' },
      { type: 'info' as const, message: 'Loading neural pathways...' },
      { type: 'success' as const, message: 'Kaiju protocols activated' },
      { type: 'warning' as const, message: 'High energy signature detected' },
      { type: 'info' as const, message: 'Analyzing threat patterns...' },
      { type: 'success' as const, message: 'Defense matrix online' },
      { type: 'command' as const, message: 'Executing routine diagnostic' },
      { type: 'info' as const, message: 'Memory bank synchronization in progress' },
      { type: 'success' as const, message: 'All systems nominal' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      const msg = logMessages[index % logMessages.length];
      setLogs((prev) => [
        ...prev.slice(-50),
        {
          id: `${Date.now()}-${index}`,
          timestamp: new Date(),
          ...msg,
        },
      ]);
      index++;
    }, 2500);

    // Initial logs
    logMessages.slice(0, 3).forEach((msg, i) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            id: `init-${i}`,
            timestamp: new Date(),
            ...msg,
          },
        ]);
      }, i * 500);
    });

    return () => clearInterval(interval);
  }, []);

  // Cycle status periodically
  useEffect(() => {
    const statuses: Array<'online' | 'processing' | 'idle' | 'error'> = ['online', 'processing', 'online', 'online'];
    let index = 0;
    const interval = setInterval(() => {
      setStatus(statuses[index % statuses.length]);
      index++;
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (content: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStatus('processing');

    // Add to logs
    setLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        timestamp: new Date(),
        type: 'command',
        message: `Command received: "${content}"`,
      },
    ]);

    // Simulate response
    setTimeout(() => {
      const responses = [
        'Command processed. Neural pathways recalibrated.',
        'Affirmative. Executing kaiju protocols.',
        'Understood. Scanning for threats in designated sector.',
        'Processing complete. Results stored in memory banks.',
        'Command acknowledged. Standing by for further instructions.',
      ];
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setStatus('online');

      setLogs((prev) => [
        ...prev,
        {
          id: `resp-${Date.now()}`,
          timestamp: new Date(),
          type: 'success',
          message: 'Command execution completed successfully',
        },
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,#1a0a2e_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#0a1a1a_0%,transparent_50%)]" />
      <ScanLine />

      {/* Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00ff88 1px, transparent 1px),
            linear-gradient(to bottom, #00ff88 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen min-h-[100dvh] flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-4 md:px-8 py-4 md:py-6 border-b border-[#00ff88]/10"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Logo */}
              <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                <motion.div
                  className="absolute inset-0 bg-[#00ff88]/20 rounded-sm"
                  animate={{ rotate: [0, 90, 180, 270, 360] }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                />
                <div className="absolute inset-1 bg-black rounded-sm flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-[#00ff88]" fill="currentColor">
                    <path d="M12 2L8 6H4V10L2 12L4 14V18H8L12 22L16 18H20V14L22 12L20 10V6H16L12 2ZM12 6L14 8H17V11L19 12L17 13V16H14L12 18L10 16H7V13L5 12L7 11V8H10L12 6Z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="font-display text-lg md:text-2xl font-black tracking-tight">
                  <GlitchText>OPENCLAW</GlitchText>
                </h1>
                <p className="font-mono text-[9px] md:text-[10px] text-gray-500 tracking-[0.2em]">
                  AI AGENT DASHBOARD v1.0.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-mono text-[10px] text-gray-600">CONNECTED TO</span>
                <span className="font-mono text-xs text-[#bf00ff]">@clawzilla_app</span>
              </div>
              <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-black/50 border border-[#00ff88]/20 rounded-sm">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="font-mono text-[10px] md:text-xs text-[#00ff88]">LAIR ACTIVE</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-8 py-4 md:py-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-full">
              {/* Status Panel */}
              <div className="lg:col-span-4">
                <StatusPanel status={status} />
              </div>

              {/* Activity Log */}
              <div className="lg:col-span-4 h-[250px] md:h-[300px] lg:h-[400px]">
                <ActivityLog logs={logs} />
              </div>

              {/* Command Chat */}
              <div className="lg:col-span-4 h-[300px] md:h-[350px] lg:h-[400px]">
                <CommandChat messages={messages} onSend={handleSendMessage} />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative px-4 md:px-8 py-4 md:py-6 border-t border-[#00ff88]/10 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="font-mono text-[10px] md:text-xs text-gray-600">
              <span className="text-[#bf00ff]/50">//</span> EXCLUSIVE LAIR FOR @clawzilla_app
            </div>
            <div className="font-mono text-[9px] md:text-[10px] text-gray-700">
              Requested by <span className="text-gray-500">@BetrNames</span> · Built by <span className="text-gray-500">@clonkbot</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
        }

        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }

        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out infinite;
        }

        .animate-glitch-2 {
          animation: glitch-2 0.3s ease-in-out infinite;
          animation-delay: 0.1s;
        }

        .animate-scan {
          animation: scan 8s linear infinite;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 136, 0.3);
          border-radius: 2px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 136, 0.5);
        }

        .font-display {
          font-family: 'Orbitron', sans-serif;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
    </div>
  );
}
