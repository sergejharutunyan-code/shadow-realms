'use client';

import { useGameStore } from '@/lib/game-store';
import { NPC_GUILDS, Guild, GuildMember } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  Users,
  Crown,
  Star,
  Shield,
  Sword,
  Coins,
  ChevronRight,
  LogOut,
  MessageSquare,
  Award,
  Flame,
  Sparkles,
  Plus,
  Check,
  X,
} from 'lucide-react';

// ----------------------- Role Config -----------------------
const ROLE_CONFIG: Record<
  GuildMember['role'],
  { icon: string; label: string; text: string; bg: string; border: string; ring: string }
> = {
  leader: {
    icon: '👑',
    label: 'Leader',
    text: 'text-amber-300',
    bg: 'bg-gradient-to-br from-amber-500/30 to-yellow-700/10',
    border: 'border-amber-500/50',
    ring: 'shadow-[0_0_12px_-2px_rgba(251,191,36,0.6)]',
  },
  officer: {
    icon: '⭐',
    label: 'Officer',
    text: 'text-purple-300',
    bg: 'bg-gradient-to-br from-slate-300/25 to-slate-500/10',
    border: 'border-slate-300/50',
    ring: 'shadow-[0_0_12px_-2px_rgba(203,213,225,0.5)]',
  },
  member: {
    icon: '•',
    label: 'Member',
    text: 'text-amber-700/80',
    bg: 'bg-gradient-to-br from-amber-700/25 to-amber-900/10',
    border: 'border-amber-700/40',
    ring: '',
  },
};

// ----------------------- Guild Theme -----------------------
const GUILD_THEME: Record<
  string,
  { gradient: string; glow: string; accentText: string; ring: string; chip: string }
> = {
  guild_1: {
    // Shadow Legion - blood red / dark purple
    gradient: 'from-red-600/40 via-rose-800/20 to-purple-900/10',
    glow: 'shadow-[0_0_40px_-12px_rgba(220,38,38,0.55)]',
    accentText: 'text-rose-300',
    ring: 'bg-gradient-to-br from-red-500 via-rose-600 to-purple-700',
    chip: 'bg-red-500/15 text-rose-300 border-red-500/30',
  },
  guild_2: {
    // Knights of Dawn - gold / amber
    gradient: 'from-amber-500/40 via-yellow-700/20 to-orange-900/10',
    glow: 'shadow-[0_0_40px_-12px_rgba(245,158,11,0.55)]',
    accentText: 'text-amber-300',
    ring: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600',
    chip: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  guild_3: {
    // Dragon Hoard - emerald / teal
    gradient: 'from-emerald-500/40 via-teal-700/20 to-green-900/10',
    glow: 'shadow-[0_0_40px_-12px_rgba(16,185,129,0.55)]',
    accentText: 'text-emerald-300',
    ring: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-700',
    chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
};

function themeFor(guild: Guild) {
  return GUILD_THEME[guild.id] ?? GUILD_THEME.guild_1;
}

function totalPower(guild: Guild): number {
  return guild.members.reduce((sum, m) => sum + m.power, 0);
}

function fmtPower(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function xpThreshold(level: number): number {
  return level * 50000;
}

// ----------------------- Decorative Divider -----------------------
function OrnateDivider() {
  return (
    <div className="flex items-center justify-center my-4 select-none" aria-hidden>
      <svg width="100%" height="14" viewBox="0 0 400 14" preserveAspectRatio="none" className="max-w-md">
        <defs>
          <linearGradient id="div-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="7" x2="180" y2="7" stroke="url(#div-grad)" strokeWidth="1" />
        <path
          d="M200 1 L208 7 L200 13 L192 7 Z"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="0.5"
        />
        <circle cx="185" cy="7" r="1.2" fill="#fbbf24" />
        <circle cx="215" cy="7" r="1.2" fill="#fbbf24" />
        <line x1="220" y1="7" x2="400" y2="7" stroke="url(#div-grad)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ----------------------- Mock Guild Chat -----------------------
const MOCK_CHAT: { name: string; role: GuildMember['role']; text: string; time: string }[] = [
  { name: 'DarkLord', role: 'leader', text: 'Guild war starts Friday — bring your best team!', time: '5m' },
  { name: 'NightBlade', role: 'officer', text: 'I can craft legendary gear for anyone who needs it 🗡️', time: '12m' },
  { name: 'SoulReaper', role: 'member', text: 'Just hit level 35! Thanks for the carries team 💀', time: '38m' },
  { name: 'GhostArrow', role: 'member', text: 'Anyone up for stage 28 co-op tonight?', time: '1h' },
];

// ----------------------- Main Component -----------------------
export function GuildScreen() {
  const guildId = useGameStore(s => s.guildId);
  const player = useGameStore(s => s.player);
  const heroes = useGameStore(s => s.heroes);
  const addNotification = useGameStore(s => s.addNotification);

  const [joinedGuildId, setJoinedGuildId] = useState<string | null>(guildId);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const joinedGuild = useMemo(
    () => NPC_GUILDS.find(g => g.id === joinedGuildId) ?? null,
    [joinedGuildId]
  );

  const playerPower = useMemo(
    () =>
      heroes.reduce(
        (sum, h) => sum + h.attack + h.defense + Math.floor(h.health / 10) + h.speed * 5,
        0
      ),
    [heroes]
  );

  function handleJoin(guild: Guild) {
    setJoinedGuildId(guild.id);
    addNotification(`⚔️ You have joined ${guild.name}! Welcome, champion.`, 'success');
  }

  function handleLeave() {
    if (joinedGuild) {
      addNotification(`You have left ${joinedGuild.name}.`, 'info');
    }
    setJoinedGuildId(null);
    setShowLeaveConfirm(false);
  }

  function handleCreateGuild() {
    addNotification('🏰 Guild Creation is coming soon! Stay tuned, champion.', 'info');
  }

  // ----------------------- NOT JOINED: Recruitment -----------------------
  if (!joinedGuild) {
    return (
      <div className="relative min-h-screen text-white">
        {/* Background: dark purple/black with radial gradients */}
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[#0a0612]" aria-hidden />
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          aria-hidden
          style={{
            background:
              'radial-gradient(circle at 15% 10%, rgba(124,45,181,0.28), transparent 45%), radial-gradient(circle at 85% 25%, rgba(220,38,38,0.18), transparent 50%), radial-gradient(circle at 50% 95%, rgba(245,158,11,0.12), transparent 55%)',
          }}
        />

        <div className="p-3 sm:p-5 max-w-5xl mx-auto">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-purple-950/60 via-[#140a22]/80 to-[#0a0612] p-5 sm:p-6"
          >
            {/* Decorative banner emoji */}
            <div className="absolute -top-6 -right-6 text-[120px] opacity-10 select-none" aria-hidden>
              ⚔️
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-purple-700/20 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_-8px_rgba(245,158,11,0.6)]"
                >
                  <Shield className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold gold-text tracking-tight">
                    Guild Hall
                  </h1>
                  <p className="text-xs sm:text-sm text-purple-200/70 mt-0.5">
                    Join forces with other champions
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateGuild}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/40 text-amber-200 text-sm font-semibold hover:from-amber-500/25 hover:to-purple-500/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Guild
              </motion.button>
            </div>
          </motion.header>

          <OrnateDivider />

          {/* Section title */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <Flame className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-200">
              Available Guilds
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent" />
            <span className="text-[10px] text-purple-300/60">{NPC_GUILDS.length} recruiting</span>
          </div>

          {/* Guild recruitment cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {NPC_GUILDS.map((guild, idx) => (
              <GuildRecruitCard
                key={guild.id}
                guild={guild}
                index={idx}
                onJoin={() => handleJoin(guild)}
              />
            ))}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-[11px] text-purple-300/50"
          >
            <Sparkles className="inline w-3 h-3 mr-1 text-amber-400/70" />
            Joining a guild grants permanent perks while you remain a member.
          </motion.div>
        </div>
      </div>
    );
  }

  // ----------------------- JOINED: My Guild -----------------------
  const theme = themeFor(joinedGuild);
  const guildPower = totalPower(joinedGuild) + playerPower;
  const threshold = xpThreshold(joinedGuild.level);
  const xpPct = Math.min(100, (joinedGuild.experience / threshold) * 100);

  // Build display member list: guild members + player (You) as a member
  const playerMember: GuildMember = {
    name: player.name,
    level: player.level,
    power: playerPower,
    role: 'member',
    contributed: 0,
    lastOnline: 'Online',
  };
  const displayMembers: (GuildMember & { isYou?: boolean })[] = [
    ...joinedGuild.members.map(m => ({ ...m })),
    { ...playerMember, isYou: true },
  ];

  // Sort by role (leader, officer, member) then power desc — keep "You" naturally by power
  const roleOrder: Record<GuildMember['role'], number> = { leader: 0, officer: 1, member: 2 };
  displayMembers.sort((a, b) => {
    if (roleOrder[a.role] !== roleOrder[b.role]) return roleOrder[a.role] - roleOrder[b.role];
    return b.power - a.power;
  });

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#0a0612]" aria-hidden />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(circle at 12% 8%, rgba(124,45,181,0.3), transparent 45%), radial-gradient(circle at 88% 20%, rgba(220,38,38,0.16), transparent 50%), radial-gradient(circle at 50% 100%, rgba(245,158,11,0.14), transparent 55%)',
        }}
      />

      <div className="p-3 sm:p-5 max-w-5xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-purple-950/60 via-[#140a22]/80 to-[#0a0612] p-5 sm:p-6 mb-4"
        >
          <div className="absolute -top-6 -right-6 text-[120px] opacity-10 select-none" aria-hidden>
            ⚔️
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 4, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-purple-700/20 border-2 border-amber-500/40 flex items-center justify-center shadow-[0_0_30px_-8px_rgba(245,158,11,0.6)]"
              >
                <Shield className="w-9 h-9 sm:w-11 sm:h-11 text-amber-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold gold-text tracking-tight">
                  Guild Hall
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/70 mt-0.5">
                  Join forces with other champions
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateGuild}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/40 text-amber-200 text-sm font-semibold hover:from-amber-500/25 hover:to-purple-500/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Guild
            </motion.button>
          </div>
        </motion.header>

        {/* My Guild Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className={`relative overflow-hidden rounded-2xl p-[2px] ${theme.ring} ${theme.glow}`}
        >
          <div className="relative rounded-2xl bg-[#0d0817]/95 p-5 sm:p-6">
            {/* glow accent */}
            <div
              className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.gradient} opacity-60`}
              aria-hidden
            />
            <div className="relative z-10 flex flex-col sm:flex-row gap-5">
              {/* Banner */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-black/60 to-purple-950/60 border-2 border-amber-500/40 flex items-center justify-center text-6xl sm:text-7xl shadow-inner"
              >
                {joinedGuild.banner}
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold gold-text tracking-tight">
                    {joinedGuild.name}
                  </h2>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${theme.chip}`}>
                    <Star className="w-3 h-3 fill-current" />
                    Lv. {joinedGuild.level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-prose">
                  {joinedGuild.description}
                </p>

                {/* Leader */}
                <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-purple-300/60">Led by</span>
                  <span className="font-semibold text-amber-200">
                    {joinedGuild.members.find(m => m.role === 'leader')?.name ?? 'Unknown'}
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <StatPill
                    icon={<Sword className="w-3.5 h-3.5" />}
                    label="Total Power"
                    value={fmtPower(guildPower)}
                    tone={theme.accentText}
                  />
                  <StatPill
                    icon={<Users className="w-3.5 h-3.5" />}
                    label="Members"
                    value={`${displayMembers.length}/${joinedGuild.maxMembers}`}
                    tone="text-purple-200"
                  />
                  <StatPill
                    icon={<Award className="w-3.5 h-3.5" />}
                    label="Perks"
                    value={`${joinedGuild.perks.length}`}
                    tone="text-amber-200"
                  />
                </div>

                {/* XP bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-purple-200/70 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Guild XP
                    </span>
                    <span className={theme.accentText}>
                      {joinedGuild.experience.toLocaleString()} / {threshold.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${theme.ring} rounded-full shadow-[0_0_10px_-1px_rgba(245,158,11,0.7)]`}
                    />
                  </div>
                  <div className="text-[10px] text-purple-300/50 mt-1">
                    {xpPct >= 100
                      ? 'Ready to level up!'
                      : `${(threshold - joinedGuild.experience).toLocaleString()} XP to Guild Lv. ${joinedGuild.level + 1}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <OrnateDivider />

        {/* Two-column: Members + Side panel */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Member list */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl border border-amber-500/15 bg-[#0f0a1c]/80 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/15 bg-gradient-to-r from-amber-900/15 to-transparent">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold text-amber-200">Guild Roster</h3>
              </div>
              <span className="text-[10px] text-purple-300/60">
                {displayMembers.length} champions
              </span>
            </div>

            <div className="max-h-[28rem] overflow-y-auto custom-scroll divide-y divide-purple-900/30">
              {displayMembers.map((m, i) => (
                <GuildMemberRow key={`${m.name}-${i}`} member={m} index={i} />
              ))}
            </div>
          </motion.section>

          {/* Side panel: Perks + Chat + Leave */}
          <div className="space-y-4">
            {/* Perks */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="rounded-2xl border border-amber-500/15 bg-[#0f0a1c]/80 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold text-amber-200">Guild Perks</h3>
              </div>
              <ul className="space-y-2">
                {joinedGuild.perks.map((perk, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className="flex items-start gap-2 text-xs text-purple-100/90"
                  >
                    <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center border ${theme.chip}`}>
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{perk}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>

            {/* Chat preview */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="rounded-2xl border border-amber-500/15 bg-[#0f0a1c]/80 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/15 bg-gradient-to-r from-purple-900/15 to-transparent">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-300" />
                  <h3 className="text-sm font-bold text-amber-200">Guild Chat</h3>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="p-3 space-y-2.5 max-h-56 overflow-y-auto custom-scroll">
                {MOCK_CHAT.map((msg, i) => {
                  const cfg = ROLE_CONFIG[msg.role];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex gap-2"
                    >
                      <span className="shrink-0 text-base leading-5">{cfg.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[11px] font-bold ${cfg.text}`}>{msg.name}</span>
                          <span className="text-[9px] text-purple-400/60">{msg.time}</span>
                        </div>
                        <p className="text-[11px] text-purple-100/80 leading-snug">{msg.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="px-3 py-2 border-t border-amber-500/10 bg-black/30 flex items-center gap-2">
                <input
                  disabled
                  placeholder="Chat with guild..."
                  className="flex-1 bg-transparent text-[11px] text-purple-100/70 placeholder:text-purple-400/40 outline-none cursor-not-allowed"
                />
                <ChevronRight className="w-4 h-4 text-purple-500/50" />
              </div>
            </motion.section>

            {/* Leave Guild */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-rose-500/50 bg-rose-950/20 text-rose-300 text-sm font-bold hover:bg-rose-900/30 hover:border-rose-500/70 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Leave Guild
            </motion.button>
          </div>
        </div>

        {/* Inline custom scrollbar styling */}
        <style>{`
          .custom-scroll::-webkit-scrollbar { width: 6px; }
          .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
          .custom-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#a855f7,#f59e0b); border-radius: 6px; }
        `}</style>
      </div>

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowLeaveConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-rose-500/40 bg-gradient-to-br from-[#1a0d1f]/95 to-[#0a0612]/95 p-6 shadow-[0_0_50px_-10px_rgba(220,38,38,0.5)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
                  <LogOut className="w-7 h-7 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-rose-200">Leave {joinedGuild.name}?</h3>
                <p className="text-xs text-purple-200/70 mt-2 max-w-[16rem]">
                  You will lose all active guild perks immediately. You can rejoin this or another
                  guild at any time.
                </p>

                <div className="flex gap-3 w-full mt-5">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-purple-500/40 bg-purple-900/20 text-purple-200 text-sm font-semibold hover:bg-purple-900/30 transition-colors"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <X className="w-4 h-4" />
                      Stay
                    </span>
                  </button>
                  <button
                    onClick={handleLeave}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white text-sm font-bold hover:from-rose-500 hover:to-red-600 transition-colors shadow-[0_0_18px_-4px_rgba(220,38,38,0.7)]"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <LogOut className="w-4 h-4" />
                      Leave
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------- Stat Pill -----------------------
function StatPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg bg-black/40 border border-white/5 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-purple-300/60">
        {icon}
        {label}
      </div>
      <div className={`text-sm font-bold ${tone} mt-0.5`}>{value}</div>
    </div>
  );
}

// ----------------------- Guild Recruitment Card -----------------------
function GuildRecruitCard({
  guild,
  index,
  onJoin,
}: {
  guild: Guild;
  index: number;
  onJoin: () => void;
}) {
  const theme = themeFor(guild);
  const power = totalPower(guild);
  const fillPct = Math.round((guild.members.length / guild.maxMembers) * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, duration: 0.45, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`group relative rounded-2xl p-[2px] ${theme.ring} ${theme.glow}`}
    >
      <div className="relative rounded-2xl bg-[#0d0817]/95 overflow-hidden">
        {/* gradient wash */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50`}
          aria-hidden
        />
        <div className="relative z-10 p-4 sm:p-5">
          {/* Top: banner + name */}
          <div className="flex items-start gap-3">
            <motion.div
              whileHover={{ rotate: -6, scale: 1.06 }}
              className="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-black/60 to-purple-950/60 border-2 border-amber-500/40 flex items-center justify-center text-4xl shadow-inner"
            >
              {guild.banner}
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold gold-text truncate">{guild.name}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${theme.chip}`}>
                  <Star className="w-3 h-3 fill-current" />
                  Lv. {guild.level}
                </span>
                <span className="text-[10px] text-purple-300/60">
                  {guild.members.length}/{guild.maxMembers} members
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-purple-100/75 mt-3 min-h-[2.5rem] leading-relaxed">
            {guild.description}
          </p>

          {/* Power + member fill */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-black/40 border border-white/5 px-2.5 py-1.5">
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-purple-300/60">
                <Sword className="w-3 h-3" />
                Guild Power
              </div>
              <div className={`text-sm font-bold ${theme.accentText}`}>{fmtPower(power)}</div>
            </div>
            <div className="rounded-lg bg-black/40 border border-white/5 px-2.5 py-1.5">
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-purple-300/60">
                <Users className="w-3 h-3" />
                Roster
              </div>
              <div className="text-sm font-bold text-purple-100">{fillPct}% full</div>
            </div>
          </div>

          {/* Perks */}
          <div className="mt-3">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-amber-200/70 mb-1.5">
              <Award className="w-3 h-3" />
              Guild Perks
            </div>
            <ul className="space-y-1">
              {guild.perks.map((perk, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[11px] text-purple-100/85">
                  <Check className={`w-3 h-3 shrink-0 ${theme.accentText}`} />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {/* Join button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onJoin}
            className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-[0_0_20px_-6px_rgba(16,185,129,0.8)] hover:from-emerald-400 hover:to-green-500 transition-colors`}
          >
            <Sword className="w-4 h-4" />
            Join Guild
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// ----------------------- Guild Member Row -----------------------
function GuildMemberRow({
  member,
  index,
}: {
  member: GuildMember & { isYou?: boolean };
  index: number;
}) {
  const cfg = ROLE_CONFIG[member.role];
  const isOnline = member.lastOnline === 'Online';
  const isYou = !!member.isYou;
  const isAlt = index % 2 === 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ backgroundColor: 'rgba(168,85,247,0.08)' }}
      className={`relative flex items-center gap-3 px-4 py-2.5 ${
        isAlt ? 'bg-purple-950/15' : 'bg-transparent'
      } ${isYou ? 'ring-1 ring-inset ring-amber-400/60 bg-amber-500/10' : ''}`}
    >
      {/* Role badge */}
      <div
        className={`relative shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border text-lg ${cfg.bg} ${cfg.border} ${cfg.ring}`}
        title={cfg.label}
      >
        {cfg.icon === '•' ? (
          <span className={`text-2xl leading-none ${cfg.text}`}>•</span>
        ) : (
          <span>{cfg.icon}</span>
        )}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold truncate ${isYou ? 'text-amber-200' : 'text-white'}`}>
            {member.name}
          </span>
          {isYou && (
            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
              YOU
            </span>
          )}
          <span className={`text-[9px] uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-purple-300/60 mt-0.5">
          <span className="flex items-center gap-0.5">
            <Sword className="w-2.5 h-2.5" />
            Lv. {member.level}
          </span>
          <span className="text-purple-500/40">·</span>
          <span className="flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5 text-rose-400/80" />
            {fmtPower(member.power)}
          </span>
        </div>
      </div>

      {/* Contribution */}
      <div className="hidden sm:block text-right">
        <div className="flex items-center gap-1 text-[10px] text-purple-300/60 justify-end">
          <Coins className="w-2.5 h-2.5 text-amber-400" />
          Contrib.
        </div>
        <div className="text-xs font-bold text-amber-300">
          {member.contributed.toLocaleString()}
        </div>
      </div>

      {/* Online status */}
      <div className="flex flex-col items-end gap-1 w-16">
        <span
          className={`flex items-center gap-1 text-[10px] font-medium ${
            isOnline ? 'text-emerald-300' : 'text-gray-500'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.7)]' : 'bg-gray-600'
            }`}
          />
          {member.lastOnline}
        </span>
      </div>
    </motion.div>
  );
}
