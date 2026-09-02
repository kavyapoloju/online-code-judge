import React from 'react';

const classes = {
  Easy: 'badge-easy',
  Medium: 'badge-medium',
  Hard: 'badge-hard',
};

export default function DifficultyBadge({ level }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${classes[level] || ''}`}>
      {level}
    </span>
  );
}
