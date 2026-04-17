'use client';
import { useState } from 'react';
import { Phone, AlertTriangle, X } from 'lucide-react';

export default function EmergencyHelp() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-3 rounded-full shadow-xl transition-all hover:scale-105"
      >
        <AlertTriangle className="w-4 h-4" />
        Emergency Help
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Phone className="w-6 h-6 text-red-400" />
              National Helplines
            </h2>
            <p className="text-slate-400 text-sm mb-6">Available 24/7 — You are not alone.</p>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">iCall — Tata Institute</p>
                <a href="tel:9152987821" className="text-2xl font-mono font-bold text-white hover:text-red-400 transition-colors">9152987821</a>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Vandrevala Foundation</p>
                <a href="tel:9999666555" className="text-2xl font-mono font-bold text-white hover:text-red-400 transition-colors">9999666555</a>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-6">Your life matters 💜</p>
          </div>
        </div>
      )}
    </>
  );
}
