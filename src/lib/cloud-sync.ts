'use client';

// ─────────────────────────────────────────────────────────────────
// Cloud sync seam
//
// The game is offline-first: accounts and saves live in localStorage
// (see auth-store.ts). This module defines the interface a real backend
// would implement so cross-device sync can be added later WITHOUT
// touching the UI or game logic.
//
// To wire Supabase (recommended):
//   1. Create a Supabase project; enable Email/Google auth.
//   2. Create a `saves` table: (user_id uuid pk, data jsonb, updated_at timestamptz)
//      with row-level security so a user can only read/write their row.
//   3. `bun add @supabase/supabase-js`, create a client with the public
//      project URL + anon key (safe to embed), and implement CloudProvider
//      below by mapping signIn/upload/download onto Supabase auth + the
//      `saves` table. Then swap `activeProvider` from `localProvider`.
// ─────────────────────────────────────────────────────────────────

export interface CloudProvider {
  readonly name: string;
  /** Whether a real remote backend is configured. */
  isRemote: boolean;
  signIn(email: string, password: string): Promise<{ ok: boolean; error?: string; userId?: string }>;
  signOut(): Promise<void>;
  /** Push the local save blob to the cloud for the given user. */
  upload(userId: string, data: unknown): Promise<{ ok: boolean; error?: string }>;
  /** Pull the cloud save blob (or null if none) for the given user. */
  download(userId: string): Promise<{ ok: boolean; data?: unknown; error?: string }>;
}

// Default: no remote backend. Everything stays local/offline.
export const localProvider: CloudProvider = {
  name: 'local',
  isRemote: false,
  async signIn() {
    return { ok: false, error: 'Cloud sync is not configured on this build' };
  },
  async signOut() {
    /* no-op */
  },
  async upload() {
    return { ok: true };
  },
  async download() {
    return { ok: true, data: null };
  },
};

// Swap this to a Supabase-backed provider to enable cross-device sync.
export const activeProvider: CloudProvider = localProvider;
