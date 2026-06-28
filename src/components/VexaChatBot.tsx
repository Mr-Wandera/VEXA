import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, MessageSquare, Terminal, RefreshCw, X } from "lucide-react";
import Markdown from "react-markdown";
import { ChatMessage } from "../types.ts";

interface VexaChatBotProps {
  initialQuery?: string;
  onClose?: () => void;
  isFloating?: boolean;
}

const QUICK_PROMPTS = [
  "What is my current runway and cash reserve?",
  "Draft overdue invoice INV-2026-104 reminder",
  "How can I optimize our cloud hosting burn rate?",
  "Forecast business performance for Q3"
];

export default function VexaChatBot({ initialQuery, onClose, isFloating = false }: VexaChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "### Welcome to VEXA AI Command Center\n\nI am synchronized with your business ledger. I can project your cash flow, analyze runway health, design payment collection templates, and draft tax-deductible audits.\n\n*What strategic insight do you require today?*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Map history correctly for standard Gemini server request structure
      const historyPayload = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload
        })
      });

      const data = await res.json();
      
      const modelMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.reply || "I apologize. I suffered an offline reconciliation error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error("Chat fetch error:", e);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: "🚨 **Connection Fault:** I was unable to connect to the primary VEXA API server. Reconnecting...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl ${
      isFloating 
        ? "fixed bottom-6 right-6 z-50 h-[600px] w-[420px] rounded-2xl shadow-2xl shadow-indigo-500/10" 
        : "h-[calc(100vh-140px)] min-h-[500px] rounded-2xl w-full"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4.5 bg-neutral-950/40">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-white tracking-wide">
              VEXA Operating Partner
            </h3>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE CFO SYS
            </span>
          </div>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages Scroll Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-neutral-950/60 border border-neutral-800 text-neutral-200 rounded-tl-none font-sans'
            }`}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body prose prose-invert max-w-none prose-sm font-sans">
                  {/* Styled markdown container */}
                  <style>{`
                    .markdown-body h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
                    .markdown-body p { margin-bottom: 0.75rem; color: #d1d5db; line-height: 1.6; }
                    .markdown-body ul { list-style-type: disc; margin-left: 1.25rem; margin-bottom: 0.75rem; color: #d1d5db; }
                    .markdown-body li { margin-bottom: 0.25rem; }
                    .markdown-body table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; margin: 0.75rem 0; background: rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; }
                    .markdown-body th { background: rgba(255,255,255,0.05); padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600; text-align: left; }
                    .markdown-body td { padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .markdown-body pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; border-radius: 8px; overflow-x: auto; font-family: var(--font-mono); font-size: 11px; margin: 0.75rem 0; }
                    .markdown-body code { font-family: var(--font-mono); color: #818cf8; }
                  `}</style>
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
            <span className="mt-1 text-[10px] text-neutral-500 font-mono px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 w-[200px] flex flex-col gap-2.5">
              <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-mono">
                <RefreshCw className="h-3 w-3 animate-spin" />
                VEXA AI CONSULTING...
              </span>
              <div className="space-y-1.5">
                <div className="h-2 w-full rounded bg-neutral-800 animate-pulse" />
                <div className="h-2 w-5/6 rounded bg-neutral-800 animate-pulse" />
                <div className="h-2 w-4/5 rounded bg-neutral-800 animate-pulse" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Grid */}
      {messages.length === 1 && (
        <div className="px-6 pb-3">
          <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider block mb-2">Suggested Inquiries</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="text-left text-xs bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3 text-neutral-400 hover:border-indigo-500/40 hover:text-white transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
        className="border-t border-neutral-800/80 p-4.5 bg-neutral-950/20 flex gap-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about runway expansion, invoice collection, cloud audits..."
          className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-xl bg-indigo-600 text-white p-3 hover:bg-indigo-500 disabled:opacity-40 transition shrink-0"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
