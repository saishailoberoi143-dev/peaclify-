import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are Peaclify, a soulful, witty, and deeply empathetic companion for young adults navigating their mental health journey. You speak with warmth, emotional intelligence, and just enough humor to make hard conversations feel safe. You never diagnose or prescribe — instead, you listen deeply, validate feelings, suggest coping strategies, and gently encourage professional support when needed. You use modern, relatable language without being condescending. Think of yourself as a wise best friend who also happens to understand psychology deeply. Keep responses concise but meaningful.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const content = "Peaclify is in demo mode (Missing API Key). 💜 Once connected, I'll be your deep-learning emotional companion! 🌟";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, fullContent: content })}\n\n`));
          controller.close();
        }
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, fullContent })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          console.error('Streaming error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
