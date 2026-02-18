'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import ThemeBanner from './ThemeBanner';

export default function AdminMonitor({ roomData, onBack }) {
    const [messages, setMessages] = useState([]);
    const [roomInfo, setRoomInfo] = useState(null);
    const [copiedA, setCopiedA] = useState(false);
    const [copiedB, setCopiedB] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io({ path: '/socket.io' });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join-admin', { roomId: roomData.roomId });
        });

        socket.on('room-joined', (info) => {
            setRoomInfo(info);
            setMessages(info.messages || []);
        });

        socket.on('new-message', (message) => {
            setMessages((prev) => [...prev, message]);
            if (message.role === 'AI') setAiLoading(false);
        });

        socket.on('participant-joined', ({ role }) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `system-${Date.now()}`,
                    type: 'system',
                    content: `${role} が参加しました`,
                    timestamp: new Date().toISOString(),
                },
            ]);
        });

        socket.on('error-msg', ({ message }) => {
            setAiLoading(false);
            alert(message);
        });

        return () => {
            socket.disconnect();
        };
    }, [roomData.roomId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const copyUrl = (url, type) => {
        navigator.clipboard.writeText(url);
        if (type === 'A') {
            setCopiedA(true);
            setTimeout(() => setCopiedA(false), 2000);
        } else {
            setCopiedB(true);
            setTimeout(() => setCopiedB(false), 2000);
        }
    };

    const downloadLog = async () => {
        try {
            const res = await fetch(`/api/rooms?roomId=${roomData.roomId}`);
            const text = await res.text();
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bridge-ai-log-${roomData.roomId}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('ログのダウンロードに失敗しました');
        }
    };

    const triggerAI = () => {
        if (!socketRef.current || aiLoading) return;
        setAiLoading(true);
        socketRef.current.emit('manual-trigger', { roomId: roomData.roomId });

        // 念のため30秒でタイムアウトしてボタンを復帰させる
        setTimeout(() => setAiLoading(false), 30000);
    };

    return (
        <div className="monitor-container">
            <div className="monitor-header">
                <button className="btn-ghost" onClick={onBack}>
                    ← 新規作成
                </button>
                <div className="monitor-header-center">
                    <h2>📡 ライブ・モニター</h2>
                    <button
                        className="btn-ai-trigger"
                        onClick={triggerAI}
                        disabled={aiLoading}
                    >
                        <span>{aiLoading ? '⏳' : '🤖'}</span>
                        {aiLoading ? 'AI思考中...' : 'AI介入を発動'}
                    </button>
                </div>
                <button className="btn-secondary" onClick={downloadLog}>
                    📥 ログDL
                </button>
            </div>

            <div className="url-panel">
                <div className="url-card url-card-a">
                    <div className="url-label">
                        <span>🔴</span> 被験者A用URL
                    </div>
                    <div className="url-row">
                        <code className="url-text">{roomData.urlA}</code>
                        <button
                            className="btn-copy"
                            onClick={() => copyUrl(roomData.urlA, 'A')}
                        >
                            {copiedA ? '✅' : '📋'}
                        </button>
                    </div>
                </div>

                <div className="url-card url-card-b">
                    <div className="url-label">
                        <span>🔵</span> 被験者B用URL
                    </div>
                    <div className="url-row">
                        <code className="url-text">{roomData.urlB}</code>
                        <button
                            className="btn-copy"
                            onClick={() => copyUrl(roomData.urlB, 'B')}
                        >
                            {copiedB ? '✅' : '📋'}
                        </button>
                    </div>
                </div>
            </div>

            {roomInfo && (
                <>
                    <ThemeBanner theme={roomInfo.theme} />
                    <div className="monitor-info-tag">
                        <span>🤖 AI強度: {roomInfo.aiStrength}</span>
                    </div>
                </>
            )}

            <div className="monitor-chat">
                <div className="monitor-messages">
                    {messages.length === 0 && (
                        <div className="monitor-empty">
                            <p>👀 被験者の参加を待っています...</p>
                            <p className="hint">上のURLをそれぞれの被験者に共有してください</p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            currentRole="admin"
                            isAdmin
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
}
