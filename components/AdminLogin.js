'use client';

import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // ID: OKI, Password: oki2031
        if (userId === 'OKI' && password === 'oki2031') {
            onLogin();
        } else {
            setError('IDまたはパスワードが正しくありません');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <span className="login-icon">🔐</span>
                    <h2>管理者ログイン</h2>
                    <p>IDとパスワードを入力してください</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label htmlFor="userId">ユーザーID</label>
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="OKI"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">パスワード</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="btn-primary btn-full">
                        ログイン
                    </button>
                </form>
            </div>
        </div>
    );
}
