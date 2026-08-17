import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageService } from '../services/messageService';
import { X, Send, Video, MessageSquare, Shield, Clock } from './Icons';


export default function LiveConsultationModal({ isOpen, onClose, appointment }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const appointmentId = appointment?._id;
  const isDoctor = user?.role === 'doctor';
  const partner = isDoctor ? appointment?.patient : appointment?.doctor;

  useEffect(() => {
    if (!isOpen || !appointmentId) return;

    // Load past messages for this appointment
    async function loadChatHistory() {
      try {
        const res = await messageService.getMessages(appointmentId);
        if (res.messages) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.warn('Could not load chat history:', err.message);
      }
    }

    loadChatHistory();

    // Join WebSocket consultation room
    if (socket) {
      socket.emit('join:consultation', appointmentId);

      const handleNewMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
      };

      const handleTyping = (data) => {
        if (data.isTyping) {
          setTypingUser(data.senderName);
          setIsTyping(true);
        } else {
          setIsTyping(false);
        }
      };

      socket.on('new:message', handleNewMessage);
      socket.on('user:typing', handleTyping);

      return () => {
        socket.emit('leave:consultation', appointmentId);
        socket.off('new:message', handleNewMessage);
        socket.off('user:typing', handleTyping);
      };
    }
  }, [isOpen, appointmentId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !appointmentId) return;

    const content = inputMessage.trim();
    setInputMessage('');

    // Emit typing stop
    if (socket) {
      socket.emit('typing:stop', { appointmentId });
    }

    try {
      const receiverId = partner?._id || partner?.id || (isDoctor ? appointment.patient : appointment.doctor);
      await messageService.sendMessage({
        appointmentId,
        receiverId,
        content
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (socket && appointmentId) {
      socket.emit('typing:start', {
        appointmentId,
        senderName: user?.name || 'Practitioner'
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { appointmentId });
      }, 1500);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '750px',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(14, 165, 233, 0.4)',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(30, 41, 59, 0.8)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <Video size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                  Live Consultation Room
                </h3>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '999px', fontWeight: 700 }}>
                  ● Secure WebSocket
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Session with {partner?.name || 'Participant'} • {appointment.timeSlot} ({new Date(appointment.appointmentDate).toDateString()})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Telehealth Banner */}
        <div style={{ padding: '0.6rem 1.5rem', background: 'rgba(14, 165, 233, 0.1)', borderBottom: '1px solid rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--primary-100)' }}>
          <Shield size={14} /> End-to-end encrypted clinical messaging channel. All discussions are saved directly to patient medical records.
        </div>

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '0.9rem' }}>Welcome to the consultation room.</p>
              <p style={{ fontSize: '0.8rem' }}>Send a message to start communicating in real time.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = (msg.sender?._id || msg.sender?.id || msg.sender) === (user?._id || user?.id);

              return (
                <div
                  key={msg._id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    {msg.sender?.name || (isMe ? 'You' : partner?.name)} • {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '0.75rem 1rem',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isMe ? 'var(--primary-gradient)' : 'rgba(30, 41, 59, 0.9)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      lineHeight: 1.4,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {msg.content || msg.message}
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-400)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              <span className="animate-pulse-slow">✍️ {typingUser} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(30, 41, 59, 0.8)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px'
          }}
        >
          <input
            type="text"
            placeholder="Type your medical query or instruction..."
            value={inputMessage}
            onChange={handleInputChange}
            className="form-input"
            style={{ margin: 0 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem', flexShrink: 0 }}>
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
