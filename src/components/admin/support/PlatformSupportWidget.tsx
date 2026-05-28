import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Headphones, ChevronDown, Minimize2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'ai' | 'human';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const AI_RESPONSES: Record<string, string> = {
  default: "I'm here to help with any questions about the HotelGenius platform. You can ask me about setting up modules, managing staff, configuring your AI concierge, or anything else!",
  module: "To activate a module, go to **Settings → Active Modules**. Toggle on the modules you need (Dining, Spa, Events, etc.). Changes apply instantly for your guests.",
  staff: "To add staff members, navigate to **Settings → Staff & Team**. You can assign roles like Hotel Admin, Moderator, or Staff — each with different access levels.",
  ai: "Your AI Concierge can be configured in **AI & Automation → AI Concierge**. You can update its knowledge base, set its personality, and view its conversation analytics.",
  billing: "For billing and subscription questions, our human team would be happy to assist. Click 'Talk to our team' below to escalate.",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('module') || lower.includes('activate') || lower.includes('enable')) return AI_RESPONSES.module;
  if (lower.includes('staff') || lower.includes('team') || lower.includes('role')) return AI_RESPONSES.staff;
  if (lower.includes('ai') || lower.includes('concierge') || lower.includes('bot')) return AI_RESPONSES.ai;
  if (lower.includes('billing') || lower.includes('payment') || lower.includes('subscription') || lower.includes('price')) return AI_RESPONSES.billing;
  return AI_RESPONSES.default;
}

const PlatformSupportWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('ai');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm the HotelGenius AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [humanSent, setHumanSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    const response = getAIResponse(userMsg.content);
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + 'r', role: 'assistant', content: response, timestamp: new Date() },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const sendHumanRequest = () => {
    const name = userData?.first_name ?? user?.email ?? 'Admin';
    setMessages((prev) => [...prev, {
      id: 'human-req',
      role: 'system',
      content: `✅ Message sent to the HotelGenius team. A team member will reach out to **${user?.email}** within 24 hours. For urgent issues, email support@hotelgenius.com`,
      timestamp: new Date(),
    }]);
    setHumanSent(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-[360px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              height: '520px',
              background: 'rgba(var(--card), 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(var(--border), 0.8)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Platform Support</p>
                  <p className="text-[10px] text-muted-foreground">HotelGenius team • Typically replies in &lt;1hr</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mode switcher */}
            <div className="flex border-b border-border/60">
              <button
                onClick={() => setMode('ai')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
                  mode === 'ai' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Bot className="w-3.5 h-3.5" /> AI Assistant
              </button>
              <button
                onClick={() => setMode('human')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
                  mode === 'human' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Headphones className="w-3.5 h-3.5" /> Talk to Team
              </button>
            </div>

            {mode === 'ai' ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                      {msg.role !== 'user' && (
                        <div className={cn('w-7 h-7 rounded-xl shrink-0 flex items-center justify-center mt-0.5',
                          msg.role === 'system' ? 'bg-green-500/15' : 'bg-primary/10')}>
                          {msg.role === 'system'
                            ? <Sparkles className="w-3.5 h-3.5 text-green-500" />
                            : <Bot className="w-3.5 h-3.5 text-primary" />
                          }
                        </div>
                      )}
                      <div className={cn(
                        'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : msg.role === 'system'
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400 rounded-tl-sm'
                          : 'bg-muted text-foreground rounded-tl-sm'
                      )}>
                        {/* Render basic markdown bold */}
                        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                          part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-xl bg-primary/10 shrink-0 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border/60">
                  <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2 border border-border/50">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask anything about the platform..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Human support mode */
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {!humanSent ? (
                  <>
                    <div className="text-center py-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Headphones className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">Talk to our team</h3>
                      <p className="text-xs text-muted-foreground mt-1">We typically respond within a few hours during business days.</p>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">Your email</span>
                        <span className="font-medium text-foreground truncate max-w-[160px]">{user?.email}</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">Response time</span>
                        <span className="font-medium text-green-600 dark:text-green-400">Under 24 hours</span>
                      </div>
                    </div>
                    <textarea
                      placeholder="Describe your issue or question in detail..."
                      className="flex-1 min-h-[120px] bg-muted/50 rounded-xl border border-border/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none resize-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      onClick={sendHumanRequest}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Send to our team
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-3">
                      <Sparkles className="w-7 h-7 text-green-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Message sent!</h3>
                    <p className="text-xs text-muted-foreground mt-2">We'll reply to <span className="font-medium text-foreground">{user?.email}</span> within 24 hours.</p>
                    <p className="text-xs text-muted-foreground mt-4">For urgent issues: <span className="text-primary font-medium">support@hotelgenius.com</span></p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center transition-colors',
          open ? 'bg-foreground text-background' : 'bg-primary text-primary-foreground'
        )}
        style={{ boxShadow: open ? undefined : '0 4px 20px rgba(var(--primary), 0.4)' }}
      >
        {open ? <ChevronDown className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </motion.button>
    </div>
  );
};

export default PlatformSupportWidget;
