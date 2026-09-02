import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard').then((res) => setLeaderboard(res.data.leaderboard)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-400 text-left">
              <tr>
                <th className="px-5 py-3">Rank</th>
                <th className="px-5 py-3">Username</th>
                <th className="px-5 py-3">Solved</th>
                <th className="px-5 py-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leaderboard.map((u) => (
                <tr key={u.rank}>
                  <td className="px-5 py-3 text-slate-400">#{u.rank}</td>
                  <td className="px-5 py-3 font-medium">{u.username}</td>
                  <td className="px-5 py-3">{u.solvedCount}</td>
                  <td className="px-5 py-3 text-brand-400">{u.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
