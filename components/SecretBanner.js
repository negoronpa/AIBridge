import { useState } from 'react';

export default function SecretBanner({ secret, role }) {
    const [isOpen, setIsOpen] = useState(true);

    if (!secret) return null;

    return (
        <div className={`secret-banner secret-banner-${role} ${isOpen ? 'is-open' : 'is-closed'}`}>
            <div className="secret-banner-inner">
                <div className="secret-header" onClick={() => setIsOpen(!isOpen)}>
                    <div className="secret-label">
                        <span className="secret-icon">⚠️</span>
                        <span>あなただけの秘密の情報（相手には見えません）</span>
                    </div>
                    <button className="btn-toggle-secret">
                        {isOpen ? '▲ 閉じる' : '▼ 広げる'}
                    </button>
                </div>
                {isOpen && (
                    <div className="secret-content">
                        <p className="secret-text pre-wrap">{secret}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
