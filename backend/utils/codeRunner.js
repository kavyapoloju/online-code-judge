/**
 * codeRunner.js
 * Executes untrusted user code against test cases using isolated temp
 * directories, per-run timeouts, and restricted spawned processes.
 *
 * Supports: javascript (node), python (python3), cpp (g++), java (javac/java)
 *
 * NOTE: This uses OS-level process isolation (temp dirs + timeouts + no
 * network flags where possible). For production-grade multi-tenant
 * isolation, run this inside a locked-down Docker container per submission
 * (e.g. `docker run --rm --network none --memory=128m --cpus=0.5 ...`).
 * The interface below is written so swapping in a Docker-based runner
 * later only requires changing `runInSandbox()`.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const TMP_ROOT = path.join(__dirname, '..', 'tmp');
if (!fs.existsSync(TMP_ROOT)) fs.mkdirSync(TMP_ROOT, { recursive: true });

const LANGUAGE_CONFIG = {
  javascript: {
    filename: 'Main.js',
    compile: null,
    run: (dir) => ({ cmd: 'node', args: ['Main.js'], cwd: dir }),
  },
  python: {
    filename: 'main.py',
    compile: null,
    run: (dir) => ({ cmd: 'python3', args: ['main.py'], cwd: dir }),
  },
  cpp: {
    filename: 'main.cpp',
    compile: (dir) => ({ cmd: 'g++', args: ['main.cpp', '-O2', '-o', 'main.out'], cwd: dir }),
    run: (dir) => ({ cmd: './main.out', args: [], cwd: dir }),
  },
  java: {
    filename: 'Main.java',
    compile: (dir) => ({ cmd: 'javac', args: ['Main.java'], cwd: dir }),
    run: (dir) => ({ cmd: 'java', args: ['-cp', dir, 'Main'], cwd: dir }),
  },
};

function makeTempDir() {
  const id = crypto.randomBytes(8).toString('hex');
  const dir = path.join(TMP_ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function runProcess({ cmd, args, cwd, input, timeoutMs }) {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(cmd, args, { cwd, shell: false });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdin.on('error', () => {}); // ignore EPIPE if process exits early
    child.stdin.write(input || '');
    child.stdin.end();

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code,
        timedOut,
        executionTimeMs: Date.now() - start,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        stdout: '',
        stderr: err.message,
        exitCode: -1,
        timedOut: false,
        executionTimeMs: Date.now() - start,
      });
    });
  });
}

async function compileIfNeeded(langConfig, dir, timeoutMs) {
  if (!langConfig.compile) return { success: true };
  const { cmd, args, cwd } = langConfig.compile(dir);
  const result = await runProcess({ cmd, args, cwd, input: '', timeoutMs });
  if (result.exitCode !== 0) {
    return { success: false, error: result.stderr || 'Compilation failed' };
  }
  return { success: true };
}

/**
 * Runs `code` against a list of test cases.
 * testCases: [{ input, expectedOutput, isSample }]
 * Returns { status, results: [...], executionTimeMs, passedTestCases, totalTestCases }
 */
async function judgeSubmission({ code, language, testCases, timeoutMs = 5000 }) {
  const langConfig = LANGUAGE_CONFIG[language];
  if (!langConfig) {
    return { status: 'Compilation Error', results: [], error: `Unsupported language: ${language}` };
  }

  const dir = makeTempDir();
  try {
    // Java requires the public class to be named Main
    const sourceCode = language === 'java' && !code.includes('class Main') ? code : code;
    fs.writeFileSync(path.join(dir, langConfig.filename), sourceCode, 'utf-8');

    const compileResult = await compileIfNeeded(langConfig, dir, timeoutMs);
    if (!compileResult.success) {
      return {
        status: 'Compilation Error',
        results: [],
        error: compileResult.error,
        passedTestCases: 0,
        totalTestCases: testCases.length,
        executionTimeMs: 0,
      };
    }

    const results = [];
    let passed = 0;
    let maxTime = 0;
    let overallStatus = 'Accepted';

    for (const tc of testCases) {
      const { cmd, args, cwd } = langConfig.run(dir);
      const runResult = await runProcess({ cmd, args, cwd, input: tc.input, timeoutMs });
      maxTime = Math.max(maxTime, runResult.executionTimeMs);

      let caseStatus;
      if (runResult.timedOut) {
        caseStatus = 'Time Limit Exceeded';
      } else if (runResult.exitCode !== 0) {
        caseStatus = 'Runtime Error';
      } else if (runResult.stdout.trim() === (tc.expectedOutput || '').trim()) {
        caseStatus = 'Passed';
        passed += 1;
      } else {
        caseStatus = 'Wrong Answer';
      }

      if (caseStatus !== 'Passed' && overallStatus === 'Accepted') {
        overallStatus = caseStatus === 'Passed' ? 'Accepted' : caseStatus;
      }

      results.push({
        input: tc.isSample ? tc.input : undefined,
        expectedOutput: tc.isSample ? tc.expectedOutput : undefined,
        actualOutput: tc.isSample ? runResult.stdout : undefined,
        status: caseStatus,
        stderr: tc.isSample ? runResult.stderr : undefined,
      });
    }

    if (passed === testCases.length) overallStatus = 'Accepted';

    return {
      status: overallStatus,
      results,
      passedTestCases: passed,
      totalTestCases: testCases.length,
      executionTimeMs: maxTime,
    };
  } finally {
    fs.rm(dir, { recursive: true, force: true }, () => {});
  }
}

module.exports = { judgeSubmission };
