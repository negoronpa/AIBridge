'use client';

import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatRoom({ messages, currentRole, onSend, nameA, nameB }) {
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || sending) return;
        setSending(true);
        onSend(input);
        setInput('');
        setTimeout(() => setSending(false), 500);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chatroom">
            <div className="chatroom-messages">
                {messages.length === 0 && (
                    <div className="chat-empty">
                        <div className="chat-empty-icon">💬</div>
                        <p>会話を始めましょう</p>
                        <p className="hint">メッセージを入力してEnterキーで送信</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        currentRole={currentRole}
                        nameA={nameA}
                        nameB={nameB}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chatroom-input-area">
                <div className="input-wrapper">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="メッセージを入力..."
                        rows={1}
                        className="chat-input"
                    />
                    <button
                        className="btn-send"
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
