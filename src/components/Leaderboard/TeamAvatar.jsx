/* eslint-disable no-unused-vars */
import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Deterministic beautiful avatar for a team.
 * Uses the team's name to pick a consistent gradient + icon letter.
 * No login needed — purely display-only.
 */

const GRADIENTS = [
  { from: '#BD9F67', to: '#e2cfab', shadow: 'rgba(189,159,103,0.4)', text: '#243137' }, // Gold theme
  { from: '#8B5CF6', to: '#C084FC', shadow: 'rgba(139,92,246,0.3)', text: '#fff' },
  { from: '#3B82F6', to: '#60A5FA', shadow: 'rgba(59,130,246,0.3)', text: '#fff' },
  { from: '#10B981', to: '#34D399', shadow: 'rgba(16,185,129,0.3)', text: '#fff' },
  { from: '#F43F5E', to: '#FB7185', shadow: 'rgba(244,63,94,0.3)', text: '#fff' },
  { from: '#06B6D4', to: '#22D3EE', shadow: 'rgba(6,182,212,0.3)', text: '#fff' },
];

function hashStr(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

const SIZE_MAP = {
  xs: { outer: 28, font: 10, border: 1 },
  sm: { outer: 36, font: 13, border: 2 },
  md: { outer: 48, font: 17, border: 2 },
  lg: { outer: 72, font: 26, border: 3 },
  xl: { outer: 96, font: 34, border: 4 },
};

const TeamAvatar = ({ team, size = 'md', className = '' }) => {
  const config = SIZE_MAP[size] || SIZE_MAP.md;
  const idx = hashStr((team?.id || '') + (team?.name || '')) % GRADIENTS.length;
  const g = GRADIENTS[idx];
  const initials = getInitials(team?.name);

  return (
    <div
      className={cn('rounded-full flex-shrink-0 flex items-center justify-center select-none font-black relative transition-transform duration-300', className)}
      style={{
        width: config.outer,
        height: config.outer,
        background: team?.avatar ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, ${g.from}, ${g.to})`,
        boxShadow: team?.avatar ? 'none' : `0 4px 15px ${g.shadow}`,
        border: `1px solid ${team?.avatar ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        fontSize: team?.avatar ? config.font * 1.5 : config.font,
        color: g.text,
        letterSpacing: '-0.02em',
      }}
    >
      {team?.avatar || initials}

      {/* Decorative inner ring for non-emoji avatars */}
      {!team?.avatar && (
        <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
      )}
    </div>
  );
};

export default TeamAvatar;
