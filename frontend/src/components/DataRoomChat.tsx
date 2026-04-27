'use client';
import { useState } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: any[];
}

export default function DataRoomChat({ orgId, token, readOnly = false }: { orgId?: string, token?: string, readOnly?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || readOnly) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, org_id: orgId, token: token })
      });

      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let aiMsg = '';
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              aiMsg += data.data;
              setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].content = aiMsg;
                return newArr;
              });
            } else if (data.type === 'sources') {
              setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].sources = data.data;
                return newArr;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f11] relative h-full">
      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Institutional Consultant</h2>
            <p className="text-zinc-500 max-w-sm">Ask anything about the company's internal data room.</p>
            {readOnly && <p className="mt-4 text-xs text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">Read-Only Investor Access</p>}
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-xl shadow-indigo-500/10' : 'bg-[#161618] text-zinc-200 border border-zinc-800/50 rounded-bl-none shadow-md'}`}>
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.sources.map((src, j) => (
                    <div key={j} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] text-zinc-400 hover:border-zinc-700 transition-colors cursor-pointer group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span className="font-bold">{src.note_title || `Doc ${j+1}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#161618] p-5 rounded-2xl rounded-bl-none border border-zinc-800/50 flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11] to-transparent">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={readOnly}
            placeholder={readOnly ? "Chat is restricted in read-only mode..." : "Query the data room..."}
            className="w-full bg-[#161618] border border-zinc-800 rounded-2xl pl-6 pr-16 py-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-2xl disabled:opacity-50"
          />
          <button type="submit" disabled={isLoading || readOnly} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
