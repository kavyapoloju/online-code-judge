import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Sharpen your code on <span className="text-brand-400">CodeJudge</span>
      </h1>
      <p className="text-slate-400 max-w-xl mx-auto mb-8">
        Solve problems, submit code in multiple languages, get instant judged results,
        and unlock AI-powered hints when you get stuck.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/problems" className="btn-primary">Browse Problems</Link>
        <Link to="/leaderboard" className="btn-secondary">View Leaderboard</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
        <div className="card p-6">
          <h3 className="font-semibold mb-2">⚡ Instant Judging</h3>
          <p className="text-sm text-slate-400">Submit code and get pass/fail results against test cases in seconds.</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-2">🧠 AI Hints</h3>
          <p className="text-sm text-slate-400">Stuck on a failing test? Get a nudge in the right direction, not the answer.</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold mb-2">🏆 Leaderboard</h3>
          <p className="text-sm text-slate-400">Track your rating and see how you stack up against other solvers.</p>
        </div>
      </div>
    </div>
  );
}
