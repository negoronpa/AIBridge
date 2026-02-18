'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { io } from 'socket.io-client';
import SecretBanner from '../../components/SecretBanner';
import ThemeBanner from '../../components/ThemeBanner';
import ChatRoom from '../../components/ChatRoom';
import '../globals.css';

function ChatContent() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room');
    const role = searchParams.get('role');

    const [connected, setConnected] = useState(false);
    const [roomInfo, setRoomInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!roomId || !role) {
            setError('URLパラメータが不正です。管理者から正しいURLを取得してください。');
            return;
        }

        const socket = io({ path: '/socket.io' });
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('join-room', { roomId, role });
        });

        socket.on('room-joined', (info) => {
            setRoomInfo(info);
            setMessages(info.messages || []);
        });

        socket.on('new-message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('error-msg', (data) => {
            setError(data.message);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomId, role]);

    const sendMessage = (content) => {
        if (!socketRef.current || !content.trim()) return;
        socketRef.current.emit('send-message', {
            roomId,
            role,
            content: content.trim(),
        });
    };

    if (error) {
        return (
            <div className="chat-page">
                <div className="chat-error">
                    <div className="error-icon">⚠️</div>
                    <h2>エラー</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!roomInfo) {
        return (
            <div className="chat-page">
                <div className="chat-loading">
                    <div className="loading-spinner"></div>
                    <p>接続中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <header className="chat-header">
                <div className="chat-header-left">
                    <span className="logo-icon-small">🌉</span>
                    <span className="chat-title">Bridge-AI</span>
                </div>
                <div className="chat-header-right">
                    <span className={`role-badge role-${role}`}>
                        {role === 'A' ? `👤 ${roomInfo.nameA}` : `👥 ${roomInfo.nameB}`}
                    </span>
                    <span className={`connection-dot ${connected ? 'online' : 'offline'}`}></span>
                </div>
            </header>

            <SecretBanner secret={roomInfo.secret} role={role} />

            <ThemeBanner theme={roomInfo.theme} />

            <ChatRoom
                messages={messages}
                currentRole={role}
                onSend={sendMessage}
                nameA={roomInfo.nameA}
                nameB={roomInfo.nameB}
            />
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="chat-page">
                    <div className="chat-loading">
                        <div className="loading-spinner"></div>
                        <p>読み込み中...</p>
                    </div>
                </div>
            }
        >
            <ChatContent />
        </Suspense>
    );
}
