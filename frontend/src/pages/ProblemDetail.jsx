import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import DifficultyBadge from '../components/DifficultyBadge';
import StatusBadge from '../components/StatusBadge';

const LANGUAGE_TEMPLATES = {
  javascript: `// Read input from stdin, print output with console.log
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (l) => lines.push(l));
rl.on('close', () => {
  // your solution here
  console.log(lines.join(' '));
});
`,
  python: `import sys

def main():
    data = sys.stdin.read().split('\\n')
    # your solution here
    print(data[0])

if __name__ == '__main__':
    main()
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // your solution here
    return 0;
}
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // your solution here
    }
}
`,
};

const MONACO_LANG = { javascript: 'javascript', python: 'python', cpp: 'cpp', java: 'java' };

export default function ProblemDetail() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.javascript);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/problems/${slug}`).then((res) => setProblem(res.data.problem));
  }, [slug]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(LANGUAGE_TEMPLATES[lang]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/submissions', { problemId: problem._id, code, language });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="text-center py-20 text-slate-400">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
      {/* Left: problem statement */}
      <div className="card p-6 h-fit lg:sticky lg:top-20">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold">{problem.title}</h1>
          <DifficultyBadge level={problem.difficulty} />
        </div>
        <div className="prose prose-invert prose-sm max-w-none text-slate-300">
          <ReactMarkdown>{problem.description}</ReactMarkdown>
        </div>
        {problem.constraints && (
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-1">Constraints</h3>
            <p className="text-sm text-slate-400 whitespace-pre-line">{problem.constraints}</p>
          </div>
        )}
        {problem.testCases?.filter((t) => t.isSample).map((tc, i) => (
          <div key={i} className="mt-4 bg-slate-950 rounded-lg p-3 text-xs font-mono">
            <p className="text-slate-500 mb-1">Sample Input {i + 1}</p>
            <pre className="whitespace-pre-wrap">{tc.input || '(none)'}</pre>
            <p className="text-slate-500 mt-2 mb-1">Expected Output</p>
            <pre className="whitespace-pre-wrap">{tc.expectedOutput}</pre>
          </div>
        ))}
        <div className="flex gap-4 mt-4 text-xs text-slate-500">
          {problem.tags?.map((t) => <span key={t}>#{t}</span>)}
        </div>
      </div>

      {/* Right: editor + results */}
      <div className="flex flex-col gap-4">
        <div className="card p-3 flex items-center justify-between">
          <select
            className="input-field w-40"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
            {submitting ? 'Judging...' : 'Submit'}
          </button>
        </div>

        <div className="card overflow-hidden">
          <Editor
            height="420px"
            theme="vs-dark"
            language={MONACO_LANG[language]}
            value={code}
            onChange={(v) => setCode(v || '')}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">{error}</div>}

        {result && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={result.submission.status} />
              <span className="text-xs text-slate-500">
                {result.submission.passedTestCases}/{result.submission.totalTestCases} test cases passed ·{' '}
                {result.submission.executionTimeMs}ms
              </span>
            </div>
            {result.judgeResult?.error && (
              <pre className="bg-slate-950 rounded-lg p-3 text-xs text-rose-400 whitespace-pre-wrap mb-3">
                {result.judgeResult.error}
              </pre>
            )}
            {result.judgeResult?.results?.filter((r) => r.input !== undefined).map((r, i) => (
              <div key={i} className="bg-slate-950 rounded-lg p-3 text-xs font-mono mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Sample {i + 1}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-slate-500">Expected:</p>
                <pre className="whitespace-pre-wrap mb-1">{r.expectedOutput}</pre>
                <p className="text-slate-500">Got:</p>
                <pre className="whitespace-pre-wrap">{r.actualOutput}</pre>
              </div>
            ))}
            {result.submission.aiHint && (
              <div className="mt-3 bg-brand-500/10 border border-brand-500/30 rounded-lg p-3">
                <p className="text-xs font-semibold text-brand-400 mb-1">🧠 AI Hint</p>
                <p className="text-sm text-slate-300">{result.submission.aiHint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
