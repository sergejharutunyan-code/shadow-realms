// ─────────────────────────────────────────────────────────────────
// Hero GLB model manifest.
//
// Maps hero templateIds to real 3D models under public/models/.
// Heroes listed here render their GLB in the battle arena; everyone
// else falls back to the procedural figure (hero-3d-model.tsx).
// Add entries as model batches are uploaded.
// ─────────────────────────────────────────────────────────────────

export const HERO_MODELS: Record<string, string> = {
  // e.g. 'knight_01': '/models/sir-galahad.glb',
};

export function getHeroModelUrl(templateId: string): string | undefined {
  return HERO_MODELS[templateId];
}
