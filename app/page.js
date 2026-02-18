'use client';

import { useRouter } from 'next/navigation';
import './globals.css';

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="landing-page">
            <div className="landing-bg-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="landing-content">
                <div className="landing-logo">
                    <span className="logo-icon">🌉</span>
                    <h1 className="logo-text">Bridge-AI</h1>
                </div>

                <p className="landing-subtitle">
                    AIが仲介する対話実験プラットフォーム
                </p>

                <p className="landing-description">
                    二者間の対話をAIがリアルタイムでファシリテーション。
                    <br />
                    秘密情報を活用した合意形成のプロセスを実験・観察できます。
                </p>

                <div className="landing-actions">
                    <button
                        className="btn-primary btn-large"
                        onClick={() => router.push('/admin')}
                    >
                        <span className="btn-icon">⚙️</span>
                        管理者画面へ
                    </button>
                </div>

                <div className="landing-features">
                    <div className="feature-card">
                        <div className="feature-icon">🎭</div>
                        <h3>シナリオ設定</h3>
                        <p>テーマと秘密情報を自由にカスタマイズ</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>リアルタイムチャット</h3>
                        <p>LINE風UIで直感的な対話体験</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI仲介</h3>
                        <p>Gemini AIが対話を促進・活性化</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
