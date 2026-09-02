import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
  const { username } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/users/${username}`).then((res) => setData(res.data));
  }, [username]);

  if (!data) return <div className="text-center py-20 text-slate-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">{data.user.username}</h1>
        <p className="text-slate-400 text-sm mt-1">{data.user.bio || 'No bio yet.'}</p>
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <p className="text-xl font-bold text-brand-400">{data.user.rating}</p>
            <p className="text-xs text-slate-500">Rating</p>
          </div>
          <div>
            <p className="text-xl font-bold">{data.user.solvedProblems.length}</p>
            <p className="text-xs text-slate-500">Solved</p>
          </div>
          <div>
            <p className="text-xl font-bold">{data.submissionCount}</p>
            <p className="text-xs text-slate-500">Submissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
