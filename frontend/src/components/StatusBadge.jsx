import React from 'react';

const colors = {
  Accepted: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Wrong Answer': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Runtime Error': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  'Time Limit Exceeded': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Compilation Error': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  Pending: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${colors[status] || colors.Pending}`}>
      {status}
    </span>
  );
}
