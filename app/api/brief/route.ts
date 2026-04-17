import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    const [{ data: moods }, { data: journals }] = await Promise.all([
      supabase.from('mood_logs').select('score, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(7),
      supabase.from('journal_entries').select('content').eq('user_id', userId).limit(5),
    ]);

    const moodStr = moods?.map((m: { score: number }) => m.score).join(', ') || 'no data';
    const journalStr = journals?.map((j: { content: string }) => j.content.slice(0, 120)).join(' | ') || 'no entries';

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: `Write a 3-sentence counselor brief summarizing this student's mental state. Mood scores (1-5) over 7 days: ${moodStr}. Journal excerpts: ${journalStr}. Be factual, empathetic, and professional.`
      }],
      max_tokens: 300,
    });

    const brief = completion.choices[0].message.content || '';
    await supabase.from('briefs').insert({ user_id: userId, summary: brief, created_at: new Date().toISOString() });

    return NextResponse.json({ brief });
  } catch (err) {
    console.error('Brief API error:', err);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}
