const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

// AI強度に応じた介入間隔
const INTERVENTION_INTERVALS = {
    low: 5,
    medium: 3,
    high: 1,
    none: 9999, // 実質的に自動介入なし
};

// 短すぎるメッセージはスキップ
const MIN_MESSAGE_LENGTH = 3;

// クールタイム管理（秒）
const cooldowns = new Map();
const COOLDOWN_SECONDS = 10; // 少し長めに設定（API保護）

/**
 * メッセージ受信時にAI介入を判定・生成
 */
async function processMessage(room, newMessage) {
    console.log(`[AI Engine] check: room=${room.id}, msgLen=${newMessage.content.length}, strength=${room.aiStrength}, count=${room.messageCount}`);

    // 短すぎるメッセージはスキップ
    if (newMessage.content.length < MIN_MESSAGE_LENGTH) {
        console.log(`[AI Engine] Skip: Message too short (${newMessage.content.length} < ${MIN_MESSAGE_LENGTH})`);
        return null;
    }

    // クールタイムチェック
    const lastCall = cooldowns.get(room.id);
    if (lastCall && Date.now() - lastCall < COOLDOWN_SECONDS * 1000) {
        console.log(`[AI Engine] Skip: Cooldown active`);
        return null;
    }

    // 介入間隔チェック
    const interval = INTERVENTION_INTERVALS[room.aiStrength] || 3;
    if (room.messageCount % interval !== 0) {
        console.log(`[AI Engine] Skip: Interval not reached (${room.messageCount} % ${interval} !== 0)`);
        return null;
    }

    // APIキーチェック
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.log('[AI] Gemini API Key not configured - skipping AI intervention');
        return null;
    }

    // 遅延初期化
    if (!genAI) {
        genAI = new GoogleGenerativeAI(apiKey);
    }

    console.log(`[AI] Attempting intervention for Room: ${room.id} (Strength: ${room.aiStrength}, Count: ${room.messageCount})`);

    cooldowns.set(room.id, Date.now());

    try {
        return await generateAIResult(room);
    } catch (error) {
        console.error('[AI Engine] processMessage caught error:', error.message);
        // 特定のエラーメッセージをユーザーに返す
        return `（${error.message}）`;
    }
}

/**
 * 手動でAI介入を強制実行
 */
async function generateManualIntervention(room) {
    // APIキーチェック
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('APIキーが設定されていません');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(apiKey);
    }

    console.log(`[AI Engine] Manual intervention triggered for Room: ${room.id}`);

    // 手動介入時はクールタイムをリセット（即座に反応させるため）
    cooldowns.delete(room.id);

    return await generateAIResult(room);
}

/**
 * 共通のAI生成ロジック
 */
async function generateAIResult(room) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // 会話履歴を構成
        const conversationHistory = room.messages
            .slice(-20) // 直近20件
            .map((m) => {
                if (m.type === 'ai') return `AIアドバイザー: ${m.content}`;
                return `${m.role}: ${m.content}`;
            })
            .join('\n');

        const systemPrompt = `あなたは「AIアドバイザー」として、二人の対話を仲介するファシリテーターです。

【対話の目的・テーマ】
${room.theme}

【重要ルール】
- あなたは${room.nameA}さんと${room.nameB}さんの「表に出していない事情（秘密）」を把握していますが、その存在を相手に悟られてはいけません。「私は秘密を知っている」といったメタ的な発言は厳禁です。
- 直接的に秘密を暴こうとするのではなく、自然な対話の中で双方が本音を出し合えるよう、さりげない質問や新しい視点を提供してください。
- あくまで第三者のファシリテーターとして、対話に厚みを持たせることを優先してください。
- 短く端的に発言してください（2-3文程度）。
- 日本語で回答してください。

${room.aiPrompt ? `【管理者からの追加指示】\n${room.aiPrompt}\n` : ''}

【${room.nameA}さんの状況】
${room.secretA}

【${room.nameB}さんの状況】
${room.secretB}

【これまでの対話履歴】
${conversationHistory}

上記の状況を踏まえ、自然な流れで対話を前進させるための短いメッセージを1つだけ作成してください。`;

        const result = await model.generateContent(systemPrompt);
        const response = result.response.text().trim();

        return response;
    } catch (error) {
        const errorMsg = error.message || 'Unknown error';
        console.error('[AI Engine Error Detalis]', errorMsg);

        if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
            throw new Error('APIの利用制限(429)が発生しています。Pro設定の反映に時間がかかっているか、別プロジェクトの制限の可能性があります。');
        }

        throw new Error(`AIエラー: ${errorMsg}`);
    }
}

module.exports = { processMessage, generateManualIntervention };
