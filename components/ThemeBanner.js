'use client';

import { useState } from 'react';

export default function ThemeBanner({ theme }) {
    const [isOpen, setIsOpen] = useState(false); // テーマは最初は閉じていても良い（または開いていても良いが、ユーザーの要望で閉じられるようにするので）

    if (!theme) return null;

    return (
        <div className={`theme-banner ${isOpen ? 'is-open' : 'is-closed'}`}>
            <div className="theme-banner-inner">
                <div className="theme-header" onClick={() => setIsOpen(!isOpen)}>
                    <div className="theme-label">
                        <span className="theme-icon">📋</span>
                        <span>対話テーマ</span>
                    </div>
                    <button className="btn-toggle-theme">
                        {isOpen ? '▲ 閉じる' : '▼ 広げる'}
                    </button>
                </div>
                {isOpen && (
                    <div className="theme-content">
                        <p className="theme-text pre-wrap">{theme}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
