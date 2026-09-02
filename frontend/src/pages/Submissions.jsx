import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions/mine').then((res) => setSubmissions(res.data.submissions)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Submissions</h1>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="text-slate-400">No submissions yet. Go solve a problem!</p>
      ) : (
        <div className="card divide-y divide-slate-800">
          {submissions.map((s) => (
            <Link
              key={s._id}
              to={`/problems/${s.problem?.slug}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/40"
            >
              <div>
                <p className="font-medium">{s.problem?.title || 'Deleted problem'}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {s.language} · {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{s.passedTestCases}/{s.totalTestCases}</span>
                <StatusBadge status={s.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
