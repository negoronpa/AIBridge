'use client';

import { useState, useEffect } from 'react';
import AdminSetup from '../../components/AdminSetup';
import AdminMonitor from '../../components/AdminMonitor';
import AdminLogin from '../../components/AdminLogin';
import '../globals.css';

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const handleLogin = () => {
        sessionStorage.setItem('adminAuth', 'true');
        setAuthenticated(true);
    };

    if (loading) return null;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <a href="/" className="admin-logo">
                    <span className="logo-icon-small">🌉</span>
                    <span>Bridge-AI</span>
                </a>
                <span className="admin-badge">管理者</span>
            </header>

            <main className="admin-main">
                {!authenticated ? (
                    <AdminLogin onLogin={handleLogin} />
                ) : !roomData ? (
                    <AdminSetup onRoomCreated={setRoomData} />
                ) : (
                    <AdminMonitor roomData={roomData} onBack={() => setRoomData(null)} />
                )}
            </main>
        </div>
    );
}
