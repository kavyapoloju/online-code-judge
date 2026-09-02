import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import DifficultyBadge from '../components/DifficultyBadge';

const emptyForm = {
  title: '',
  description: '',
  difficulty: 'Easy',
  tags: '',
  constraints: '',
  timeLimitMs: 2000,
  testCases: [{ input: '', expectedOutput: '', isSample: true }],
};

export default function Admin() {
  const [problems, setProblems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadProblems = () => {
    api.get('/problems', { params: { limit: 100 } }).then((res) => setProblems(res.data.problems));
  };

  useEffect(() => { loadProblems(); }, []);

  const updateTestCase = (idx, field, value) => {
    const testCases = [...form.testCases];
    testCases[idx] = { ...testCases[idx], [field]: field === 'isSample' ? value : value };
    setForm({ ...form, testCases });
  };

  const addTestCase = () => {
    setForm({ ...form, testCases: [...form.testCases, { input: '', expectedOutput: '', isSample: false }] });
  };

  const removeTestCase = (idx) => {
    setForm({ ...form, testCases: form.testCases.filter((_, i) => i !== idx) });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      timeLimitMs: Number(form.timeLimitMs),
    };
    try {
      if (editingId) {
        await api.put(`/problems/${editingId}`, payload);
        setMessage('Problem updated.');
      } else {
        await api.post('/problems', payload);
        setMessage('Problem created.');
      }
      resetForm();
      loadProblems();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (p) => {
    api.get(`/problems/${p.slug}`).then((res) => {
      const prob = res.data.problem;
      setForm({
        title: prob.title,
        description: prob.description,
        difficulty: prob.difficulty,
        tags: (prob.tags || []).join(', '),
        constraints: prob.constraints || '',
        timeLimitMs: prob.timeLimitMs,
        testCases: prob.testCases.length ? prob.testCases : emptyForm.testCases,
      });
      setEditingId(prob._id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem permanently?')) return;
    await api.delete(`/problems/${id}`);
    loadProblems();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Admin — Manage Problems</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-10">
        <h2 className="font-semibold">{editingId ? 'Edit Problem' : 'Create New Problem'}</h2>
        {message && <div className="text-sm text-brand-400">{message}</div>}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Difficulty</label>
            <select className="input-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Description (Markdown supported)</label>
          <textarea required rows={5} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Tags (comma-separated)</label>
            <input className="input-field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-slate-400 block mb-1">Time limit (ms)</label>
            <input type="number" className="input-field" value={form.timeLimitMs} onChange={(e) => setForm({ ...form, timeLimitMs: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 block mb-1">Constraints</label>
          <textarea rows={2} className="input-field" value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-400">Test Cases</label>
            <button type="button" onClick={addTestCase} className="text-xs text-brand-400">+ Add test case</button>
          </div>
          {form.testCases.map((tc, idx) => (
            <div key={idx} className="grid sm:grid-cols-2 gap-2 mb-3 bg-slate-950 p-3 rounded-lg">
              <div>
                <label className="text-xs text-slate-500">Input</label>
                <textarea rows={2} className="input-field" value={tc.input} onChange={(e) => updateTestCase(idx, 'input', e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-500">Expected Output</label>
                <textarea rows={2} required className="input-field" value={tc.expectedOutput} onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)} />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <label className="text-xs text-slate-500 flex items-center gap-1">
                  <input type="checkbox" checked={tc.isSample} onChange={(e) => updateTestCase(idx, 'isSample', e.target.checked)} />
                  Visible sample (shown to users)
                </label>
                {form.testCases.length > 1 && (
                  <button type="button" onClick={() => removeTestCase(idx)} className="text-xs text-rose-400 ml-auto">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary">{editingId ? 'Update Problem' : 'Create Problem'}</button>
          {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel Edit</button>}
        </div>
      </form>

      <h2 className="font-semibold mb-3">All Problems</h2>
      <div className="card divide-y divide-slate-800">
        {problems.map((p) => (
          <div key={p._id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <span>{p.title}</span>
              <DifficultyBadge level={p.difficulty} />
            </div>
            <div className="flex gap-3 text-sm">
              <button onClick={() => handleEdit(p)} className="text-brand-400">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="text-rose-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
