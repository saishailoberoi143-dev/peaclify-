'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { analyzeEmotions, getEmotionColor, getEmotionGlow, type HumeAnalysis } from '@/lib/hume';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  User,
  Bot,
  Volume2,
  Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotions?: HumeAnalysis;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hey there 💜 I'm Peaclify, your personal wellness companion. How are you feeling today? No filters needed — this is a safe space.",
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingContent]);

  // ===== STREAMING CHAT SEND =====
  const sendToChat = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Run emotion analysis on user text
    const emotions = await analyzeEmotions(text);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      emotions,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        // Handle SSE streaming
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.done) {
                    fullContent = data.fullContent || fullContent;
                  } else if (data.content) {
                    fullContent += data.content;
                    setStreamingContent(fullContent);
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent || "I'm here for you. Could you tell me more?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
      } else {
        // Non-streaming JSON response (demo mode)
        const data = await res.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            data.message?.content ||
            "I'm here for you. Could you tell me more about what you're feeling?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm having a little trouble connecting right now, but I'm still here for you. Try again in a moment? 💜",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const handleSend = () => sendToChat(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ===== MICROPHONE RECORDING =====
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size === 0) return;

        setIsTranscribing(true);

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();

          if (data.text && data.text.trim()) {
            // Auto-fill and auto-send
            setInput(data.text);
            // Small delay so user sees the transcription before it sends
            setTimeout(() => {
              sendToChat(data.text);
            }, 500);
          } else if (data.error) {
            console.error('Transcription error:', data.error);
            setInput('[Voice input failed — try again]');
          }
        } catch (err) {
          console.error('Transcription fetch error:', err);
          setInput('[Could not reach transcription service]');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ===== EMOTION BADGE COMPONENT =====
  const EmotionBadges = ({ emotions }: { emotions?: HumeAnalysis }) => {
    if (!emotions || emotions.emotions.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="flex items-center gap-1.5 mt-2 flex-wrap"
      >
        {emotions.emotions.slice(0, 3).map((emotion) => (
          <span
            key={emotion.name}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium border"
            style={{
              backgroundColor: `${getEmotionColor(emotion.name)}15`,
              borderColor: `${getEmotionColor(emotion.name)}30`,
              color: getEmotionColor(emotion.name),
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: getEmotionColor(emotion.name) }}
            />
            {emotion.name}: {Math.round(emotion.score * 100)}%
          </span>
        ))}
      </motion.div>
    );
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-nebula" />
              Chat with <span className="glow-text">Peaclify</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-sm mt-1"
            >
              Your empathetic AI companion — always here to listen
            </motion.p>
          </div>

          {/* Voice Orb */}
          <motion.div
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                isRecording
                  ? 'bg-gradient-to-br from-red-500 to-ember'
                  : 'bg-gradient-to-br from-nebula to-ember'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6 text-white relative z-10" />
              ) : (
                <Volume2 className="w-6 h-6 text-white relative z-10" />
              )}
              {/* Pulsing glow ring */}
              <div
                className={`absolute inset-0 rounded-full opacity-50 blur-md ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-ember animate-pulse'
                    : 'bg-gradient-to-br from-nebula to-ember animate-pulse-glow'
                }`}
              />
              <div
                className={`absolute inset-[-4px] rounded-full border-2 ${
                  isRecording
                    ? 'border-red-500/40 animate-pulse'
                    : 'border-nebula/20 animate-pulse-glow'
                }`}
              />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isRecording ? 'Stop Recording' : 'Voice Mode'}
            </span>
          </motion.div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-nebula to-ember'
                      : 'bg-white/10'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Bubble — with emotion glow */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 transition-shadow duration-500 ${
                    message.role === 'assistant'
                      ? 'glass-card bg-white/[0.03]'
                      : 'bg-gradient-to-br from-nebula/30 to-nebula/10 border border-nebula/20'
                  } ${
                    message.emotions
                      ? getEmotionGlow(message.emotions.dominantEmotion)
                      : ''
                  }`}
                >
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {/* Emotion badges */}
                  <EmotionBadges emotions={message.emotions} />
                  <p className="text-[10px] text-slate-500 mt-2">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Live streaming content */}
          <AnimatePresence>
            {isTyping && streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nebula to-ember flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="glass-card bg-white/[0.03] px-4 py-3 rounded-2xl max-w-[75%]">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {streamingContent}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-nebula ml-0.5 rounded-sm"
                    />
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typing Indicator (no streaming yet) */}
          <AnimatePresence>
            {isTyping && !streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nebula to-ember flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="glass-card px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-nebula"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4">
          <div className="glass-strong p-2 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isTranscribing
                  ? 'Transcribing your voice...'
                  : isRecording
                  ? '🎙 Recording... click mic to stop'
                  : "Type something... I'm listening 💜"
              }
              rows={1}
              disabled={isRecording}
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm sm:text-base resize-none outline-none px-4 py-3 max-h-32 disabled:opacity-50"
              style={{ minHeight: '44px' }}
            />
            <div className="flex items-center gap-1 pb-1">
              {/* Mic Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                disabled={isTranscribing}
                className={`p-3 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : isTranscribing
                    ? 'text-slate-600'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isTranscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isRecording}
                className="p-3 rounded-xl bg-gradient-to-br from-nebula to-ember text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">
            Peaclify is an AI companion, not a licensed therapist. If you&apos;re in
            crisis, please reach out to a professional or call 988 Suicide &amp;
            Crisis Lifeline.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
