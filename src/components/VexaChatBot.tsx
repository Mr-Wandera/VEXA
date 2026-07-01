import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, RefreshCw, X, RotateCcw } from "lucide-react";
import Markdown from "react-markdown";
import { ChatMessage } from "../types.ts";
import { apiClient } from "../lib/apiClient";

interface VexaChatBotProps {
  initialQuery?: string;
  onClose?: () => void;
  variant?: "floating" | "embedded";
}

const QUICK_PROMPTS = [
  "What is my current runway and cash reserve?",
  "Draft overdue invoice INV-2026-104 reminder",
  "How can I optimize our cloud hosting burn rate?",
  "Forecast business performance for Q3",
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "model",
  text: "### Welcome to VEXA AI\n\nI'm synchronized with your business ledger. I can project cash flow, analyze runway health, design payment collection templates, and draft tax-deductible audits.\n\n*What strategic insight do you need today?*",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function VexaChatBot({ initialQuery, onClose, variant = "floating" }: VexaChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sentQueryRef = useRef<string | null>(null);

  const handleSendMessage = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput("");
    setLoading(true);
    setShowPrompts(false);

    try {
      const historyPayload = currentMessages
        .filter((msg) => msg.id !== "welcome")
        .slice(0, -1) // Exclude the just-added user message — it's sent as textToSend
        .map((msg) => ({ role: msg.role, parts: [{ text: msg.text }] }));

      const data = await apiClient.chat(textToSend, historyPayload);

      const modelMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.reply || "I apologize. I encountered an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (e) {
      console.error("Chat fetch error:", e);
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: "model",
        text: "**Connection Error:** Unable to reach the VEXA AI server. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && initialQuery !== sentQueryRef.current) {
      sentQueryRef.current = initialQuery;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, handleSendMessage]);

  useEffect(() => {
    const handleChatQuery = (e: Event) => {
      const query = (e as CustomEvent).detail;
      if (query) handleSendMessage(query);
    };
    window.addEventListener("vexa-chat-query", handleChatQuery);
    return () => window.removeEventListener("vexa-chat-query", handleChatQuery);
  }, [handleSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleClearConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setShowPrompts(true);
    setInput("");
  };

  const containerHeight = variant === "embedded" ? "h-[calc(100vh-220px)] min-h-[400px]" : "h-[calc(100vh-140px)] min-h-[500px]";

  return (
    <div className={`flex flex-col ${containerHeight} w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 p-2 text-white shadow-lg shadow-primary-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold gradient-animated">VEXA AI</h3>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-success-400">
              <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={handleClearConversation}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5 text-neutral-400 transition hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary-600 text-white rounded-tr-sm"
                : "border border-white/[0.06] bg-white/[0.03] text-neutral-200 rounded-tl-sm"
            }`}>
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body prose prose-invert max-w-none prose-sm">
                  <style>{`
                    .markdown-body h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem; }
                    .markdown-body p { margin-bottom: 0.75rem; color: #d1d5db; line-height: 1.6; }
                    .markdown-body ul { list-style-type: disc; margin-left: 1.25rem; margin-bottom: 0.75rem; color: #d1d5db; }
                    .markdown-body li { margin-bottom: 0.25rem; }
                    .markdown-body table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 11px; margin: 0.75rem 0; background: rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; }
                    .markdown-body th { background: rgba(255,255,255,0.05); padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 600; text-align: left; }
                    .markdown-body td { padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .markdown-body pre { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 10px; border-radius: 8px; overflow-x: auto; font-family: var(--font-mono); font-size: 11px; margin: 0.75rem 0; }
                    .markdown-body code { font-family: var(--font-mono); color: #34d399; }
                  `}</style>
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
            <span className="mt-1 px-1 font-mono text-[10px] text-neutral-600">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-[200px] rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-primary-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
                ANALYZING...
              </span>
              <div className="mt-2.5 space-y-1.5">
                <div className="h-2 w-full rounded bg-white/[0.04] animate-pulse" />
                <div className="h-2 w-5/6 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-2 w-4/5 rounded bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {showPrompts && (
        <div className="px-5 pb-3">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-neutral-600">Suggested Inquiries</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 text-left text-xs text-neutral-400 transition hover:border-primary-500/30 hover:text-white"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
        className="flex gap-2.5 border-t border-white/[0.06] p-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about runway, invoices, costs..."
          className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-primary-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-xl bg-primary-600 p-3 text-white transition hover:bg-primary-500 disabled:opacity-40 btn-press"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
