'use client';

import { useState } from 'react';
import AdminSetup from '../../components/AdminSetup';
import AdminMonitor from '../../components/AdminMonitor';
import '../globals.css';

export default function AdminPage() {
    const [roomData, setRoomData] = useState(null);

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
                {!roomData ? (
                    <AdminSetup onRoomCreated={setRoomData} />
                ) : (
                    <AdminMonitor roomData={roomData} onBack={() => setRoomData(null)} />
                )}
            </main>
        </div>
    );
}
