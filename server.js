const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { loadEnvConfig } = require('@next/env');

// Load environment variables before requiring other modules
const projectDir = process.cwd();
const env = loadEnvConfig(projectDir);
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log(`[Server] Environment loaded from ${projectDir}. API Key present: ${!!apiKey}`);

const { Server } = require('socket.io');
const { roomStore } = require('./app/lib/roomStore');
const { processMessage, generateManualIntervention } = require('./app/lib/aiEngine');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Allow external connections (Required for Railway/Docker)
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
        cors: { origin: '*' },
        path: '/socket.io',
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.id}`);

        // 被験者がルームに参加
        socket.on('join-room', ({ roomId, role }) => {
            const room = roomStore.getRoom(roomId);
            if (!room) {
                socket.emit('error-msg', { message: 'ルームが見つかりません' });
                return;
            }

            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.role = role;

            // ルーム情報を送信
            const roomInfo = {
                id: roomId,
                theme: room.theme,
                nameA: room.nameA,
                nameB: room.nameB,
                messages: room.messages,
            };

            if (role === 'A') {
                roomInfo.secret = room.secretA;
            } else if (role === 'B') {
                roomInfo.secret = room.secretB;
            }

            socket.emit('room-joined', roomInfo);

            // 管理者に参加通知
            io.to(`admin-${roomId}`).emit('participant-joined', { role });

            console.log(`[Room ${roomId}] ${role} joined`);
        });

        // 管理者がモニタールームに参加
        socket.on('join-admin', ({ roomId }) => {
            const room = roomStore.getRoom(roomId);
            if (!room) {
                socket.emit('error-msg', { message: 'ルームが見つかりません' });
                return;
            }

            socket.join(`admin-${roomId}`);
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.data.role = 'admin';

            socket.emit('room-joined', {
                id: room.id,
                theme: room.theme,
                nameA: room.nameA,
                nameB: room.nameB,
                secretA: room.secretA,
                secretB: room.secretB,
                aiStrength: room.aiStrength,
                messages: room.messages,
            });

            console.log(`[Room ${roomId}] Admin joined`);
        });

        // メッセージ送信
        socket.on('send-message', async ({ roomId, role, content }) => {
            const room = roomStore.getRoom(roomId);
            if (!room) {
                console.log(`[Room ${roomId}] Send failed: Room not found`);
                return;
            }

            const message = {
                id: Date.now().toString(),
                role,
                content,
                timestamp: new Date().toISOString(),
                type: 'user',
            };

            roomStore.addMessage(roomId, message);
            console.log(`[Room ${roomId}] Received message from ${role}: "${content}" (Count: ${room.messageCount})`);

            // 全員にブロードキャスト
            io.to(roomId).emit('new-message', message);

            // AI介入判定
            try {
                console.log(`[Room ${roomId}] Triggering AI process...`);
                const aiResponse = await processMessage(room, message);
                if (aiResponse) {
                    const aiMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'AI',
                        content: aiResponse,
                        timestamp: new Date().toISOString(),
                        type: 'ai',
                    };

                    roomStore.addMessage(roomId, aiMessage);
                    io.to(roomId).emit('new-message', aiMessage);

                    console.log(`[Room ${roomId}] AI: ${aiResponse}`);
                }
            } catch (err) {
                console.error('[AI Error]', err.message);
            }
        });

        // 手動AI介入（管理者用）
        socket.on('manual-trigger', async ({ roomId }) => {
            const room = roomStore.getRoom(roomId);
            if (!room) return;

            console.log(`[Room ${roomId}] Admin triggered manual AI intervention`);

            try {
                const aiResponse = await generateManualIntervention(room);
                if (aiResponse) {
                    const aiMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'AI',
                        content: aiResponse,
                        timestamp: new Date().toISOString(),
                        type: 'ai',
                    };

                    roomStore.addMessage(roomId, aiMessage);
                    io.to(roomId).emit('new-message', aiMessage);
                    console.log(`[Room ${roomId}] AI (Manual): ${aiResponse}`);
                }
            } catch (err) {
                console.error('[Manual AI Error]', err.message);
                socket.emit('error-msg', { message: err.message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });

    httpServer.listen(port, () => {
        console.log(`\n  🌉 Bridge-AI Server running at http://${hostname}:${port}\n`);
    });
});
