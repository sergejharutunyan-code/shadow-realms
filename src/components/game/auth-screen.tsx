'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, AVATARS, type Account } from '@/lib/auth-store';
import { feedback } from '@/lib/feedback';
import { Swords, UserPlus, LogIn, Ghost, ChevronLeft, ShieldCheck } from 'lucide-react';

type Mode = 'welcome' | 'signup' | 'pin';

function AvatarBadge({ index, size = 44 }: { index: number; size?: number }) {
  const a = AVATARS[index] ?? AVATARS[0];
  return (
    <div
      className="rounded-xl flex items-center justify-center shadow-lg"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${a.from}, ${a.to})` }}
    >
      <span style={{ fontSize: size * 0.44 }}>{a.emoji}</span>
    </div>
  );
}

export function AuthScreen() {
  const accounts = useAuthStore((s) => s.accounts);
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);
  const playAsGuest = useAuthStore((s) => s.playAsGuest);

  const [mode, setMode] = useState<Mode>('welcome');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState<Account | null>(null);

  const reset = () => { setUsername(''); setPin(''); setError(''); setAvatar(0); setPending(null); };

  const doCreate = () => {
    feedback.unlock();
    const res = signUp(username, pin, avatar);
    if (!res.ok) { setError(res.error ?? 'Could not create profile'); feedback.error(); return; }
    feedback.victory();
  };

  const startSignIn = (acc: Account) => {
    feedback.tap();
    if (acc.pin) { setPending(acc); setPin(''); setError(''); setMode('pin'); return; }
    const res = signIn(acc.username, '');
    if (!res.ok) { setError(res.error ?? 'Could not sign in'); feedback.error(); }
    else feedback.select();
  };

  const confirmPin = () => {
    if (!pending) return;
    const res = signIn(pending.username, pin);
    if (!res.ok) { setError(res.error ?? 'Incorrect PIN'); feedback.error(); }
    else feedback.select();
  };

  return (
    <div className="fixed inset-0 z-50 dark-fantasy-bg particles-bg flex items-center justify-center p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Crest */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-red-600 to-purple-800 flex items-center justify-center shadow-xl shadow-purple-900/40 premium-avatar-frame"
          >
            <Swords className="w-8 h-8 text-white drop-shadow" />
          </motion.div>
          <h1 className="mt-3 text-2xl font-black premium-gold-text tracking-wide">SHADOW REALMS</h1>
          <p className="text-xs text-amber-200/50 tracking-[0.25em] uppercase">Champions of Darkness</p>
        </div>

        <div className="glass-panel rounded-2xl border border-amber-500/15 p-5 shadow-2xl">
          <AnimatePresence mode="wait">
            {mode === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {accounts.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-widest text-amber-400/60 font-bold mb-2">Choose your champion</p>
                    <div className="flex flex-col gap-2">
                      {accounts.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => startSignIn(acc)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left"
                        >
                          <AvatarBadge index={acc.avatar} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{acc.username}</div>
                            <div className="text-[10px] text-gray-400">{acc.pin ? 'PIN protected' : 'Tap to enter'}</div>
                          </div>
                          {acc.pin ? <ShieldCheck className="w-4 h-4 text-amber-400/70" /> : <LogIn className="w-4 h-4 text-amber-400/70" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { feedback.tap(); reset(); setMode('signup'); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-600/30 hover:brightness-110 transition-all"
                >
                  <UserPlus className="w-5 h-5" /> Create Profile
                </button>
                <button
                  onClick={() => { feedback.tap(); playAsGuest(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-all"
                >
                  <Ghost className="w-4 h-4" /> Play as Guest
                </button>
                <p className="text-[10px] text-center text-gray-500 mt-3 leading-relaxed">
                  Profiles are saved on this device and work offline. Cloud sync across devices can be enabled later.
                </p>
              </motion.div>
            )}

            {mode === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => { feedback.tap(); reset(); setMode('welcome'); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-3">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <label className="text-[11px] uppercase tracking-widest text-amber-400/60 font-bold">Champion name</label>
                <input
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  maxLength={16}
                  placeholder="Enter a name"
                  className="w-full mt-1.5 mb-3 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none"
                />
                <label className="text-[11px] uppercase tracking-widest text-amber-400/60 font-bold">Emblem</label>
                <div className="grid grid-cols-6 gap-2 mt-1.5 mb-3">
                  {AVATARS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setAvatar(i); feedback.tap(); }}
                      className={`rounded-xl p-0.5 transition-all ${avatar === i ? 'ring-2 ring-amber-400 scale-105' : 'ring-1 ring-white/10 opacity-70'}`}
                    >
                      <AvatarBadge index={i} size={36} />
                    </button>
                  ))}
                </div>
                <label className="text-[11px] uppercase tracking-widest text-amber-400/60 font-bold">PIN (optional)</label>
                <input
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                  inputMode="numeric"
                  placeholder="4-digit PIN to protect this profile"
                  className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:border-amber-500/50 focus:outline-none tracking-[0.4em]"
                />
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
                <button
                  onClick={doCreate}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-600/30 hover:brightness-110 transition-all"
                >
                  Begin Your Legend
                </button>
              </motion.div>
            )}

            {mode === 'pin' && pending && (
              <motion.div key="pin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => { feedback.tap(); reset(); setMode('welcome'); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-3">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <AvatarBadge index={pending.avatar} size={56} />
                  <div className="text-sm font-bold text-white">{pending.username}</div>
                </div>
                <label className="text-[11px] uppercase tracking-widest text-amber-400/60 font-bold">Enter PIN</label>
                <input
                  autoFocus
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmPin(); }}
                  inputMode="numeric"
                  className="w-full mt-1.5 px-3 py-3 text-center rounded-xl bg-black/40 border border-white/10 text-white text-xl tracking-[0.6em] focus:border-amber-500/50 focus:outline-none"
                />
                {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
                <button
                  onClick={confirmPin}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-600/30 hover:brightness-110 transition-all"
                >
                  Enter Realm
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
