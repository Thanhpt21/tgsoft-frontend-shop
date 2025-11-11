import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, sessionId } = await req.json();

    if (!message) return NextResponse.json({ error: 'No message' }, { status: 400 });

    // Gọi OpenAI
    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Bạn là trợ lý hỗ trợ khách hàng.' },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      }),
    });

    const data = await openAiRes.json();
    const aiMessage = data?.choices?.[0]?.message?.content || 'Xin lỗi, tôi không trả lời được.';

    // Trả về message AI
    return NextResponse.json({
      message: aiMessage,
      senderType: 'BOT',
      conversationId,
      sessionId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'Lỗi server AI' }, { status: 500 });
  }
}
