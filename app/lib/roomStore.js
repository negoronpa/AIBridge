const { v4: uuidv4 } = require('uuid');

// In-memory room storage (shared across module contexts via globalThis)
if (!globalThis.bridgeAiRooms) {
    globalThis.bridgeAiRooms = new Map();
}
const rooms = globalThis.bridgeAiRooms;

const roomStore = {
    createRoom({ theme, secretA, secretB, aiStrength, nameA, nameB, aiPrompt }) {
        const roomId = uuidv4().slice(0, 8);
        const room = {
            id: roomId,
            theme,
            secretA,
            secretB,
            aiPrompt: aiPrompt || '',
            nameA: nameA || '被験者A',
            nameB: nameB || '被験者B',
            aiStrength: aiStrength || 'medium',
            messages: [],
            messageCount: 0,
            createdAt: new Date().toISOString(),
        };
        rooms.set(roomId, room);
        return room;
    },

    getRoom(roomId) {
        return rooms.get(roomId) || null;
    },

    addMessage(roomId, message) {
        const room = rooms.get(roomId);
        if (!room) return;
        room.messages.push(message);
        if (message.type === 'user') {
            room.messageCount++;
        }
    },

    getRoomLog(roomId) {
        const room = rooms.get(roomId);
        if (!room) return null;

        let log = `=== Bridge-AI 会話ログ ===\n`;
        log += `テーマ: ${room.theme}\n`;
        log += `作成日時: ${room.createdAt}\n`;
        log += `AI強度: ${room.aiStrength}\n`;
        log += `---\n\n`;

        room.messages.forEach((msg) => {
            const time = new Date(msg.timestamp).toLocaleTimeString('ja-JP');
            if (msg.type === 'ai') {
                log += `[${time}] 🤖 AIアドバイザー: ${msg.content}\n`;
            } else {
                log += `[${time}] ${msg.role}: ${msg.content}\n`;
            }
        });

        return log;
    },

    listRooms() {
        return Array.from(rooms.values()).map((r) => ({
            id: r.id,
            theme: r.theme,
            messageCount: r.messages.length,
            createdAt: r.createdAt,
        }));
    },
};

module.exports = { roomStore };
