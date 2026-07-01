'use client';

// ─────────────────────────────────────────────────────────────────
// Accounts / login (offline-first)
//
// Local profile system: create/sign-in to named profiles (optional
// PIN), or play as guest. Each real account gets its own namespaced
// game save, so progress is per-account on the device. A CloudProvider
// seam is defined so a real backend (e.g. Supabase) can be plugged in
// later for cross-device sync without touching the UI.
// ─────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useGameStore } from './game-store';

export interface Account {
  id: string;
  username: string;
  pin?: string; // optional 4-digit local PIN (device-only, not secure auth)
  avatar: number; // index into AVATARS
  createdAt: number;
  isGuest?: boolean;
}

export const AVATARS: { from: string; to: string; emoji: string }[] = [
  { from: '#f59e0b', to: '#b91c1c', emoji: '⚔️' },
  { from: '#6366f1', to: '#7c3aed', emoji: '🔮' },
  { from: '#059669', to: '#065f46', emoji: '🏹' },
  { from: '#db2777', to: '#7c3aed', emoji: '🔥' },
  { from: '#0891b2', to: '#1e3a8a', emoji: '❄️' },
  { from: '#a16207', to: '#3f3f46', emoji: '💀' },
];

const BASE_SAVE = 'shadow-realms-game-v6';

// Point the game store's persisted save at the given account, then sync
// the champion's display name. Guests use the shared base save so the
// existing/offline progress is preserved.
function applySaveNamespace(user: Account | null) {
  if (typeof window === 'undefined') return;
  const name = user && !user.isGuest ? `${BASE_SAVE}::${user.id}` : BASE_SAVE;
  try {
    const persistApi = (useGameStore as unknown as {
      persist?: {
        getOptions?: () => { name?: string };
        setOptions?: (o: { name: string }) => void;
        rehydrate?: () => Promise<void> | void;
      };
    }).persist;
    const setName = () => {
      if (user) useGameStore.setState((s) => ({ player: { ...s.player, name: user.username } }));
    };
    if (persistApi?.getOptions?.().name !== name && persistApi?.setOptions) {
      persistApi.setOptions({ name });
      const p = persistApi.rehydrate?.();
      if (p && typeof (p as Promise<void>).then === 'function') (p as Promise<void>).then(setName);
      else setName();
    } else {
      setName();
    }
  } catch {
    /* ignore */
  }
}

interface AuthState {
  user: Account | null;
  accounts: Account[];
  _hydrated: boolean;
  signUp: (username: string, pin: string, avatar: number) => { ok: boolean; error?: string };
  signIn: (username: string, pin: string) => { ok: boolean; error?: string };
  playAsGuest: () => void;
  signOut: () => void;
  deleteAccount: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accounts: [],
      _hydrated: false,

      signUp: (username, pin, avatar) => {
        const name = username.trim();
        if (name.length < 2) return { ok: false, error: 'Name must be at least 2 characters' };
        if (get().accounts.some((a) => a.username.toLowerCase() === name.toLowerCase()))
          return { ok: false, error: 'That name is already taken on this device' };
        const account: Account = {
          id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          username: name,
          pin: pin || undefined,
          avatar,
          createdAt: Date.now(),
        };
        set((s) => ({ accounts: [...s.accounts, account], user: account }));
        applySaveNamespace(account);
        return { ok: true };
      },

      signIn: (username, pin) => {
        const acc = get().accounts.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
        if (!acc) return { ok: false, error: 'No profile with that name on this device' };
        if (acc.pin && acc.pin !== pin) return { ok: false, error: 'Incorrect PIN' };
        set({ user: acc });
        applySaveNamespace(acc);
        return { ok: true };
      },

      playAsGuest: () => {
        const guest: Account = {
          id: 'guest',
          username: 'Champion',
          avatar: 0,
          createdAt: Date.now(),
          isGuest: true,
        };
        set({ user: guest });
        applySaveNamespace(guest);
      },

      signOut: () => {
        set({ user: null });
        applySaveNamespace(null);
      },

      deleteAccount: (id) => {
        if (typeof window !== 'undefined') {
          try { localStorage.removeItem(`${BASE_SAVE}::${id}`); } catch { /* ignore */ }
        }
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          user: s.user?.id === id ? null : s.user,
        }));
      },
    }),
    {
      name: 'shadow-realms-auth',
      partialize: (s) => ({ user: s.user, accounts: s.accounts }),
      onRehydrateStorage: () => (state) => {
        // Restore the correct per-account save on launch.
        if (state) {
          applySaveNamespace(state.user);
          state._hydrated = true;
        }
      },
    },
  ),
);
