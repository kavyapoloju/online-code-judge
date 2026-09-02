import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-brand-400 flex items-center gap-2">
          <span className="text-xl">{'</>'}</span> CodeJudge
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/problems" className="text-slate-300 hover:text-white">Problems</Link>
          <Link to="/leaderboard" className="text-slate-300 hover:text-white">Leaderboard</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-slate-300 hover:text-white">Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/submissions" className="text-slate-300 hover:text-white">My Submissions</Link>
              <span className="text-slate-500">|</span>
              <Link to={`/profile/${user.username}`} className="text-slate-300 hover:text-white">{user.username}</Link>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white">Login</Link>
              <Link to="/register" className="btn-primary text-xs py-1.5">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
