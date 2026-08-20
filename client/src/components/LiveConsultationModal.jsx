import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageService } from '../services/messageService';
import { X, Send, Video, MessageSquare, Shield } from './Icons';

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

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        style={{
          maxWidth: '700px',
          height: '75vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '12px 12px 0 0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--primary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-500)'
              }}
            >
              <Video size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Consultation Chat
                </h3>
                <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--accent-emerald-bg)', color: 'var(--accent-emerald)', borderRadius: '4px', fontWeight: 600 }}>
                  Connected
                </span>
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                {partner?.name || 'Participant'} • {appointment.timeSlot}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{ padding: '0.5rem 1.25rem', background: 'var(--primary-50)', borderBottom: '1px solid rgba(2, 132, 199, 0.2)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary-600)' }}>
          <Shield size={13} /> Messages in this consultation are saved to patient medical records.
        </div>

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4, color: 'var(--primary-500)' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Consultation room ready</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Send a message to start communicating.</p>
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    {msg.sender?.name || (isMe ? 'You' : partner?.name)} • {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '0.65rem 0.95rem',
                      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: isMe ? 'var(--primary-500)' : 'var(--bg-primary)',
                      color: isMe ? '#ffffff' : 'var(--text-primary)',
                      border: isMe ? 'none' : '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      lineHeight: 1.45
                    }}
                  >
                    {msg.content || msg.message}
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-500)', fontSize: '0.775rem', fontStyle: 'italic', fontWeight: 600 }}>
              <span>{typingUser} is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '0.85rem 1.25rem',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            borderRadius: '0 0 12px 12px'
          }}
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={handleInputChange}
            className="form-input"
            style={{ margin: 0 }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 1.25rem', flexShrink: 0 }}>
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
