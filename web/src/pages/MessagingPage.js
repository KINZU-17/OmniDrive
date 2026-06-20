import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { usePageTitle } from '../utils/usePageTitle';

export default function MessagingPage() {
  usePageTitle('Messages');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    // Register user in chat system
    api.post('/api/chat/auth', {}).catch(() => {});
    loadRooms();
  }, [user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 4 seconds when a room is active
  useEffect(() => {
    if (!activeRoom) return;
    loadMessages(activeRoom.id);
    pollRef.current = setInterval(() => loadMessages(activeRoom.id), 4000);
    return () => clearInterval(pollRef.current);
  }, [activeRoom]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await api.get('/api/chat/rooms');
      setRooms(data.data?.rooms || []);
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadMessages = async (roomId) => {
    setLoadingMessages(true);
    try {
      const data = await api.get(`/api/chat/messages?roomId=${roomId}`);
      setMessages(data.data?.messages || []);
    } catch {
      // silently fail on poll
    } finally {
      setLoadingMessages(false);
    }
  };

  const selectRoom = async (room) => {
    clearInterval(pollRef.current);
    setMessages([]);
    setActiveRoom(room);
    // Auto-join the room so messages endpoint allows access
    try { await api.post(`/api/chat/rooms/${room.id}/join`, {}); } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeRoom) return;
    const text = input.trim();
    setInput('');
    // Optimistic update
    const optimistic = {
      id: `opt-${Date.now()}`,
      content: text,
      senderId: user.email,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      await api.post('/api/chat/messages', { roomId: activeRoom.id, content: text });
    } catch {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const data = await api.post('/api/chat/rooms', {
        name: newRoomName.trim(),
        description: newRoomDesc.trim(),
        isPublic: true,
      });
      setNewRoomName('');
      setNewRoomDesc('');
      setShowNewRoom(false);
      await loadRooms();
      // Auto-select the new room
      if (data.data?.roomId) {
        const newRoom = { id: data.data.roomId, name: newRoomName.trim(), description: newRoomDesc.trim() };
        setActiveRoom(newRoom);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Messages</h1>
          <button
            onClick={() => setShowNewRoom(v => !v)}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Room
          </button>
        </div>

        {/* New room form */}
        {showNewRoom && (
          <div className="card p-4 mb-4">
            <h3 className="text-white font-semibold mb-3 text-sm">Create Chat Room</h3>
            <form onSubmit={createRoom} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Room name"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                className="input-field text-sm"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newRoomDesc}
                onChange={e => setNewRoomDesc(e.target.value)}
                className="input-field text-sm"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={creating} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewRoom(false); setError(''); }}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex-1 flex gap-4 min-h-0 h-[calc(100vh-220px)]">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 card overflow-y-auto">
            <div className="p-4 border-b border-dark-border">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">Rooms</h2>
            </div>
            {loadingRooms ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-[#6e7681] text-sm">No rooms yet</p>
                <p className="text-[#6e7681] text-xs mt-1">Create one above to start chatting</p>
              </div>
            ) : (
              rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => selectRoom(room)}
                  className={`w-full text-left px-4 py-3 border-b border-dark-border/50 hover:bg-dark-surface transition-colors ${activeRoom?.id === room.id ? 'bg-dark-surface border-l-2 border-l-accent' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                      {room.name?.[0]?.toUpperCase() || '#'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{room.name}</p>
                      <p className="text-[#6e7681] text-xs">{room.memberCount || 0} member{room.memberCount !== 1 ? 's' : ''}</p>
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
                    <p className="text-white text-sm font-semibold">{activeRoom.name}</p>
                    {activeRoom.description && (
                      <p className="text-[#6e7681] text-xs">{activeRoom.description}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {loadingMessages && messages.length === 0 && (
                    <div className="flex justify-center pt-8">
                      <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                    </div>
                  )}
                  {messages.map(msg => {
                    const ismine = msg.senderId === user.email;
                    return (
                      <div key={msg.id} className={`flex ${ismine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 ${ismine ? 'bg-accent text-white rounded-br-sm' : 'bg-dark-surface text-[#e6edf3] rounded-bl-sm'}`}>
                          {!ismine && (
                            <p className="text-xs text-[#6e7681] mb-1">{msg.senderId}</p>
                          )}
                          <p className="text-sm break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${ismine ? 'text-white/60' : 'text-[#6e7681]'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
                <h3 className="text-white font-semibold">Select a room</h3>
                <p className="text-[#6e7681] text-sm">Choose a chat room from the sidebar, or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
