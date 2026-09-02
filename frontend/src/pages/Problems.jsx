import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DifficultyBadge from '../components/DifficultyBadge';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/problems', { params: { search, difficulty, page } })
      .then((res) => {
        setProblems(res.data.problems);
        setPages(res.data.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, difficulty, page]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Problems</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="input-field sm:max-w-xs"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
        />
        <select className="input-field sm:max-w-[160px]" value={difficulty} onChange={(e) => { setPage(1); setDifficulty(e.target.value); }}>
          <option value="">All difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : problems.length === 0 ? (
        <p className="text-slate-400">No problems found.</p>
      ) : (
        <div className="card divide-y divide-slate-800">
          {problems.map((p) => (
            <Link
              key={p._id}
              to={`/problems/${p.slug}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <div className="flex gap-2 mt-1">
                  {p.tags?.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs text-slate-500">#{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {p.totalSubmissions
                    ? `${Math.round((p.acceptedSubmissions / p.totalSubmissions) * 100)}% accepted`
                    : 'No submissions yet'}
                </span>
                <DifficultyBadge level={p.difficulty} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-lg text-sm ${n === page ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
