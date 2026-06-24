import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAssistant } from '../services/gemini';
import { GeminiBadge } from '../components/common/Badges';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

const QUICK_PROMPTS = [
  '🕳️ How do I report a pothole?',
  '💧 There is a water leak near my house',
  '🚨 What to do in a flood emergency?',
  '📊 What is the Civic Priority Score?',
  '🔍 How does AI analyze my report?',
  '📞 Emergency service numbers',
];

const AIAssistant: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello${userProfile ? `, **${userProfile.name}**` : ''}! I'm **CivicEye Assistant**, your AI-powered civic helpdesk.

I can help you with:
- 📝 Reporting civic issues (potholes, garbage, water leaks, streetlights)
- 🚨 Emergency guidance and helpline numbers
- 📊 Understanding your issue status and priority scores
- 🗺️ Finding nearby emergency services
- ❓ Any civic-related questions

How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await chatWithAssistant(history, text.trim());
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: "I'm having connectivity issues. For emergencies, please call **112** immediately. For issue reporting, use the [Report Issue](/report) page.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Simple markdown renderer
  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-civic-blue-light underline">$1</a>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="section-container py-8 flex-1 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #1E6FFF)' }}>
              🤖
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
                CivicEye Assistant
                <GeminiBadge />
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online · Powered by Gemini AI
              </div>
            </div>
          </div>
          <button
            onClick={() => setMessages([messages[0]])}
            className="btn-ghost text-sm px-3 py-1.5"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Chat Window */}
        <div className="flex-1 glass-card overflow-hidden flex flex-col" style={{ minHeight: '500px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 mb-1">
                    {msg.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        {currentUser?.photoURL ? (
                          <img src={currentUser.photoURL} alt="You" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-civic-blue/30 flex items-center justify-center text-xs font-bold text-white">
                            {userProfile?.name?.[0] || 'U'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #1E6FFF)' }}>
                        🤖
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-lg ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={msg.role === 'user' ? 'chat-user' : 'chat-ai'}>
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                      />
                    </div>
                    <span className="text-[10px] text-civic-text-dim px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-end gap-3"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #1E6FFF)' }}>🤖</div>
                <div className="chat-ai">
                  <div className="flex gap-1 py-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-civic-text-dim animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-6 py-3 border-t border-civic-border">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border border-civic-border text-civic-text-muted hover:border-civic-blue/40 hover:text-white hover:bg-civic-blue/10 transition-all duration-200 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-civic-border">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about civic issues, emergencies, reporting..."
                className="input-dark flex-1 py-3"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary px-5 py-3 disabled:opacity-50"
                id="send-message-btn"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : '→'}
              </button>
            </form>
            <p className="text-[10px] text-civic-text-dim mt-2 text-center">
              CivicEye Assistant · Powered by Gemini AI · For emergencies call 112
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
