import { roomStore } from '../../lib/roomStore';

export async function POST(request) {
    try {
        const body = await request.json();
        const { theme, secretA, secretB, aiStrength, nameA, nameB, aiPrompt } = body;

        if (!theme || !secretA || !secretB) {
            return Response.json(
                { error: 'テーマ、Aの秘密、Bの秘密は全て必須です' },
                { status: 400 }
            );
        }

        const room = roomStore.createRoom({ theme, secretA, secretB, aiStrength, nameA, nameB, aiPrompt });

        const baseUrl = request.headers.get('host') || 'localhost:3000';
        const protocol = request.headers.get('x-forwarded-proto') || 'http';

        return Response.json({
            roomId: room.id,
            urlA: `${protocol}://${baseUrl}/chat?room=${room.id}&role=A`,
            urlB: `${protocol}://${baseUrl}/chat?room=${room.id}&role=B`,
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (roomId) {
        const log = roomStore.getRoomLog(roomId);
        if (!log) {
            return Response.json({ error: 'ルームが見つかりません' }, { status: 404 });
        }
        return new Response(log, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': `attachment; filename="bridge-ai-log-${roomId}.txt"`,
            },
        });
    }

    const rooms = roomStore.listRooms();
    return Response.json({ rooms });
}
