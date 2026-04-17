export interface HumeEmotion {
  name: string;
  score: number;
}

export interface HumeAnalysis {
  emotions: HumeEmotion[];
  dominantEmotion: string;
  timestamp: number;
}

const HUME_API_URL = 'https://api.hume.ai/v0/batch/jobs';

/**
 * Analyze emotions from text using Hume AI Expression Measurement API.
 * Falls back to local keyword analysis if API key is not set.
 */
export async function analyzeEmotions(text: string): Promise<HumeAnalysis> {
  const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;

  if (apiKey) {
    try {
      return await analyzeWithHumeAPI(text, apiKey);
    } catch (err) {
      console.warn('Hume API failed, using local analysis:', err);
    }
  }

  return analyzeLocally(text);
}

/**
 * Call Hume AI REST API for emotion analysis on text.
 */
async function analyzeWithHumeAPI(text: string, apiKey: string): Promise<HumeAnalysis> {
  const response = await fetch('https://api.hume.ai/v0/batch/jobs', {
    method: 'POST',
    headers: {
      'X-Hume-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      models: {
        language: {},
      },
      text: [text],
    }),
  });

  if (!response.ok) {
    throw new Error(`Hume API error: ${response.status}`);
  }

  const data = await response.json();

  // Parse Hume response format
  const predictions = data?.results?.predictions?.[0]?.models?.language?.grouped_predictions?.[0]?.predictions?.[0]?.emotions;

  if (predictions && Array.isArray(predictions)) {
    const emotions: HumeEmotion[] = predictions
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 5)
      .map((e: { name: string; score: number }) => ({
        name: e.name,
        score: Math.round(e.score * 100) / 100,
      }));

    return {
      emotions,
      dominantEmotion: emotions[0]?.name || 'Neutral',
      timestamp: Date.now(),
    };
  }

  return analyzeLocally(text);
}

/**
 * Local keyword-based emotion analysis (fallback).
 */
function analyzeLocally(text: string): HumeAnalysis {
  const lower = text.toLowerCase();
  const emotions: HumeEmotion[] = [];

  const patterns: Record<string, string[]> = {
    Anxiety: ['anxious', 'worried', 'nervous', 'stress', 'panic', 'overwhelm', 'fear', 'scared'],
    Sadness: ['sad', 'depressed', 'lonely', 'cry', 'hurt', 'pain', 'grief', 'miss', 'lost'],
    Joy: ['happy', 'excited', 'grateful', 'joy', 'love', 'amazing', 'wonderful', 'great'],
    Anger: ['angry', 'frustrated', 'furious', 'mad', 'annoyed', 'irritated', 'rage'],
    Calmness: ['calm', 'peace', 'relax', 'serene', 'mindful', 'meditate', 'breathe', 'content'],
    Confusion: ['confused', 'lost', 'uncertain', 'don\'t know', 'unsure', 'unclear'],
    Hope: ['hope', 'better', 'improve', 'progress', 'forward', 'faith', 'believe', 'try'],
    Contemplation: ['think', 'wonder', 'reflect', 'consider', 'realize', 'understand'],
  };

  for (const [emotion, keywords] of Object.entries(patterns)) {
    const matchCount = keywords.filter((k) => lower.includes(k)).length;
    if (matchCount > 0) {
      emotions.push({
        name: emotion,
        score: Math.min(0.95, 0.3 + matchCount * 0.2),
      });
    }
  }

  // Default baseline emotions if nothing matched
  if (emotions.length === 0) {
    emotions.push(
      { name: 'Contemplation', score: 0.5 },
      { name: 'Calmness', score: 0.4 },
      { name: 'Interest', score: 0.3 },
    );
  }

  emotions.sort((a, b) => b.score - a.score);

  return {
    emotions: emotions.slice(0, 5),
    dominantEmotion: emotions[0]?.name || 'Neutral',
    timestamp: Date.now(),
  };
}

/**
 * Get emotion color for UI rendering.
 */
export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    Anxiety: '#ef4444',
    Sadness: '#3b82f6',
    Joy: '#fbbf24',
    Anger: '#ff6b35',
    Calmness: '#06b6d4',
    Confusion: '#a78bfa',
    Hope: '#22c55e',
    Contemplation: '#7c3aed',
    Interest: '#06b6d4',
    Neutral: '#94a3b8',
  };
  return colors[emotion] || '#94a3b8';
}

/**
 * Get emotion gradient for glow aura effect.
 */
export function getEmotionGlow(emotion: string): string {
  const glows: Record<string, string> = {
    Anxiety: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    Sadness: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    Joy: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
    Anger: 'shadow-[0_0_20px_rgba(255,107,53,0.3)]',
    Calmness: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    Confusion: 'shadow-[0_0_20px_rgba(167,139,250,0.3)]',
    Hope: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    Contemplation: 'shadow-[0_0_20px_rgba(124,58,237,0.3)]',
  };
  return glows[emotion] || '';
}
