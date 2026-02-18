'use client';

export default function MessageBubble({ message, currentRole, isAdmin, nameA, nameB }) {
    const { role, content, timestamp, type } = message;
    const senderName = role === 'A' ? nameA : nameB;
    const isSelf = role === currentRole;

    const formatTime = (ts) => {
        try {
            return new Date(ts).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    // システムメッセージ（参加通知など）
    if (type === 'system') {
        return (
            <div className="message-system">
                <span>{content}</span>
            </div>
        );
    }

    // AIメッセージ
    if (type === 'ai') {
        return (
            <div className="message-row message-ai">
                <div className="message-ai-card">
                    <div className="ai-header">
                        <span className="ai-avatar">🤖</span>
                        <span className="ai-name">AIアドバイザー</span>
                        <span className="message-time">{formatTime(timestamp)}</span>
                    </div>
                    <p className="ai-content">{content}</p>
                </div>
            </div>
        );
    }

    // 管理者ビューでは全メッセージにroleラベルを表示
    if (isAdmin) {
        return (
            <div className={`message-row message-admin-view message-role-${role}`}>
                <div className="message-bubble-admin">
                    <div className="admin-msg-header">
                        <span className={`admin-role-tag role-tag-${role}`}>
                            {senderName || role}
                        </span>
                        <span className="message-time">{formatTime(timestamp)}</span>
                    </div>
                    <p className="pre-wrap">{content}</p>
                </div>
            </div>
        );
    }

    // 被験者ビュー
    return (
        <div className={`message-row ${isSelf ? 'message-self' : 'message-other'}`}>
            {!isSelf && (
                <div className="message-avatar">
                    {role === 'A' ? '👤' : '👥'}
                </div>
            )}
            <div className="message-content-wrapper">
                {!isSelf && (
                    <span className="message-sender">
                        {senderName || (role === 'A' ? '参加者A' : '参加者B')}
                    </span>
                )}
                <div className={`message-bubble ${isSelf ? 'bubble-self' : 'bubble-other'}`}>
                    <p className="pre-wrap">{content}</p>
                </div>
                <span className="message-time">{formatTime(timestamp)}</span>
            </div>
        </div>
    );
}
