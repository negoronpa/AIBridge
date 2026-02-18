'use client';

import { useState } from 'react';

export default function AdminSetup({ onRoomCreated }) {
    const [theme, setTheme] = useState('');
    const [nameA, setNameA] = useState('被験者A');
    const [nameB, setNameB] = useState('被験者B');
    const [secretA, setSecretA] = useState('');
    const [secretB, setSecretB] = useState('');
    const [aiStrength, setAiStrength] = useState('medium');
    const [aiPrompt, setAiPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme, nameA, nameB, secretA, secretB, aiStrength, aiPrompt }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'ルーム作成に失敗しました');
            }

            const data = await res.json();
            onRoomCreated(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-container">
            <div className="setup-header">
                <h2>🎭 シナリオ・インジェクター</h2>
                <p>対話実験のシナリオを設定してください</p>
            </div>

            <form onSubmit={handleSubmit} className="setup-form">
                <div className="form-group">
                    <label htmlFor="theme">
                        <span className="label-icon">📋</span>
                        テーマ・背景
                    </label>
                    <textarea
                        id="theme"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="例: 新規事業の方針について、A部門とB部門で合意形成を行ってください。限られた予算をどう配分するかが論点です。"
                        rows={4}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="nameA">
                            <span className="label-icon">👤</span>
                            名前 (Aさん)
                        </label>
                        <input
                            id="nameA"
                            type="text"
                            value={nameA}
                            onChange={(e) => setNameA(e.target.value)}
                            placeholder="例: 佐藤"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="nameB">
                            <span className="label-icon">👤</span>
                            名前 (Bさん)
                        </label>
                        <input
                            id="nameB"
                            type="text"
                            value={nameB}
                            onChange={(e) => setNameB(e.target.value)}
                            placeholder="例: 鈴木"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="secretA">
                            <span className="label-icon">🔴</span>
                            {nameA} の秘密
                        </label>
                        <textarea
                            id="secretA"
                            value={secretA}
                            onChange={(e) => setSecretA(e.target.value)}
                            placeholder={`${nameA}さんだけが知っている極秘情報を入力してください`}
                            rows={3}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="secretB">
                            <span className="label-icon">🔵</span>
                            {nameB} の秘密
                        </label>
                        <textarea
                            id="secretB"
                            value={secretB}
                            onChange={(e) => setSecretB(e.target.value)}
                            placeholder={`${nameB}さんだけが知っている極秘情報を入力してください`}
                            rows={3}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="aiStrength">
                        <span className="label-icon">🤖</span>
                        AIの強度
                    </label>
                    <div className="strength-selector">
                        {['none', 'low', 'medium', 'high'].map((level) => (
                            <button
                                key={level}
                                type="button"
                                className={`strength-btn ${aiStrength === level ? 'active' : ''}`}
                                onClick={() => setAiStrength(level)}
                            >
                                <span className="strength-emoji">
                                    {level === 'none' ? '⚪' : level === 'low' ? '🟢' : level === 'medium' ? '🟡' : '🔴'}
                                </span>
                                <span className="strength-label">
                                    {level === 'none' ? 'None' : level === 'low' ? 'Low' : level === 'medium' ? 'Medium' : 'High'}
                                </span>
                                <span className="strength-desc">
                                    {level === 'none'
                                        ? '手動のみ'
                                        : level === 'low'
                                            ? '5発言ごと'
                                            : level === 'medium'
                                                ? '3発言ごと'
                                                : '毎発言'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="aiPrompt">
                        <span className="label-icon">📝</span>
                        AIカスタム指示 (オプション)
                    </label>
                    <textarea
                        id="aiPrompt"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="AIの振る舞いを細かく指定したい場合に入力してください。空欄の場合はデフォルトの指示が使われます。"
                        rows={4}
                    />
                    <p className="hint" style={{ marginTop: '4px' }}>
                        例: 「秘密を知っていることは一切言及せず、自然な雑談を装ってください」「もっと積極的に質問を投げかけてください」など
                    </p>
                </div>

                {error && <div className="form-error">{error}</div>}

                <button type="submit" className="btn-primary btn-submit" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="loading-spinner-small"></span>
                            作成中...
                        </>
                    ) : (
                        <>
                            <span>🚀</span>
                            ルームを作成
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
