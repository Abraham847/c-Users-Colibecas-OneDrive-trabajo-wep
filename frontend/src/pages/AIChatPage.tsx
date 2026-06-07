import { useState, useRef, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { Bot, Send, Loader, X, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '¡Hola! Soy el asistente IA de CloudHost. Puedo ayudarte con dominios, hosting, DNS, SSL, correos, despliegues y más. ¿En qué puedo ayudarte?', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const socket = getSocket();
      socket.emit('ai:chat', { message: input, context: messages.slice(-10).map(m => ({ role: m.role, content: m.content })) });
      socket.once('ai:response', (data) => {
        setMessages(prev => [...prev, { role: 'ai', content: data.message, timestamp: data.timestamp }]);
        setLoading(false);
      });
      socket.once('ai:error', () => {
        setMessages(prev => [...prev, { role: 'ai', content: 'Lo siento, ocurrió un error. Intenta de nuevo.', timestamp: new Date().toISOString() }]);
        setLoading(false);
      });

      setTimeout(() => {
        setLoading(false);
      }, 10000);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Error de conexión. Intenta de nuevo.', timestamp: new Date().toISOString() }]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-500 flex">
      <div className="flex-1 flex flex-col">
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Bot size={24} className="text-primary-400" />
            <div>
              <h2 className="text-white font-semibold">AI Asistente CloudHost</h2>
              <p className="text-xs text-gray-500">Asistente inteligente 24/7</p>
            </div>
          </div>
          <a href="/dashboard" className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5">
            <X size={20} />
          </a>
        </header>

        <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-white" /></div>}
              <div className={`max-w-[70%] p-4 rounded-2xl ${msg.role === 'user' ? 'gradient-bg text-white' : 'glass text-gray-200'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-2 opacity-50">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><Bot size={16} className="text-white" /></div>
              <div className="glass p-4 rounded-2xl">
                <Loader className="animate-spin" size={18} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 p-4">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="input-field flex-1"
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary flex items-center gap-2">
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">Este asistente usa IA para proporcionar ayuda. Verifica información crítica con soporte humano.</p>
        </div>
      </div>
    </div>
  );
}
