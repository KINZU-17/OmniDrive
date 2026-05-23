import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MessagingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetch('/api/chat/rooms').then(r => r.json()).then(d => setRooms(d.rooms || [])).catch(() => {});
  }, [user, navigate]);

  useEffect(() => {
    if (!activeRoom) return;
    fetch(`/api/chat/rooms/${activeRoom.id}/messages`)
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(() => {});
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeRoom) return;
    const text = input.trim();
    setInput('');
    const optimistic = { id: Date.now(), content: text, sender: user.name, createdAt: new Date().toISOString(), mine: true };
    setMessages(prev => [...prev, optimistic]);
    try {
      await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
    } catch {}
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-black text-white mb-6">Messages</h1>
        <div className="flex-1 flex gap-4 min-h-0 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 card overflow-y-auto">
            <div className="p-4 border-b border-dark-border">
              <h2 className="text-sm font-semibold text-[#8b949e] uppercase tracking-wide">Conversations</h2>
            </div>
            {rooms.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[#6e7681] text-sm">No conversations yet</p>
              </div>
            ) : (
              rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left px-4 py-3 border-b border-dark-border/50 hover:bg-dark-surface transition-colors ${activeRoom?.id === room.id ? 'bg-dark-surface' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                      {room.name?.[0]?.toUpperCase() || '#'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{room.name || 'Chat Room'}</p>
                      <p className="text-[#6e7681] text-xs truncate">{room.lastMessage || 'No messages yet'}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat area */}
          <div className="flex-1 card flex flex-col overflow-hidden">
            {activeRoom ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-dark-border flex items-center gap-3 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                    {activeRoom.name?.[0]?.toUpperCase() || '#'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{activeRoom.name || 'Chat Room'}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 ${msg.mine ? 'bg-accent text-white rounded-br-sm' : 'bg-dark-surface text-[#e6edf3] rounded-bl-sm'}`}>
                        {!msg.mine && <p className="text-xs text-[#6e7681] mb-1">{msg.sender}</p>}
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.mine ? 'text-white/60' : 'text-[#6e7681]'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="px-5 py-3 border-t border-dark-border flex gap-2 flex-shrink-0">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-1 text-sm py-2"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
                <svg className="w-12 h-12 text-dark-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-white font-semibold">Select a conversation</h3>
                <p className="text-[#6e7681] text-sm">Choose a chat from the sidebar to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
