
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Globe, ExternalLink, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

const SearchChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const grounding = response.candidates?.[0]?.groundingMetadata;
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || 'I could not find a response.',
        grounding: grounding,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Sorry, I encountered an error searching for that. Please try again.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/30">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Globe className="text-blue-400" />
          Grounded Search
        </h2>
        <p className="text-slate-400">Accurate, real-time info powered by Google Search.</p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="p-6 bg-slate-800/50 rounded-full">
              <Bot size={48} className="opacity-20" />
            </div>
            <p className="text-lg">Ask me anything about current events or complex facts.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'
            }`}>
              {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
            </div>
            
            <div className={`max-w-[80%] space-y-3 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600/10 border border-blue-500/20 text-blue-50' 
                  : 'bg-slate-800 border border-slate-700 text-slate-200'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>

              {msg.grounding?.groundingChunks && msg.grounding.groundingChunks.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Globe size={14} />
                    <span>Search Citations</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.grounding.groundingChunks.map((chunk, idx) => (
                      chunk.web && (
                        <a 
                          key={idx}
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-xs text-blue-400 rounded-lg transition-colors border border-slate-600"
                        >
                          <span className="truncate max-w-[150px]">{chunk.web.title}</span>
                          <ExternalLink size={12} />
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center animate-pulse">
              <Bot size={20} className="text-slate-500" />
            </div>
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span className="text-slate-400 italic">Searching the web...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Search for recent news, technical specs, or travel advice..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`px-6 rounded-xl flex items-center justify-center transition-all ${
              !input.trim() || isLoading 
                ? 'bg-slate-700 text-slate-500' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchChat;
