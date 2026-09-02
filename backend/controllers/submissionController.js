const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { judgeSubmission } = require('../utils/codeRunner');
const { getAIHint } = require('../utils/aiHint');

// @route POST /api/submissions   (create + judge a submission)
const createSubmission = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'problemId, code and language are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const judgeResult = await judgeSubmission({
      code,
      language,
      testCases: problem.testCases,
      timeoutMs: problem.timeLimitMs || Number(process.env.EXECUTION_TIMEOUT_MS) || 5000,
    });

    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      code,
      language,
      status: judgeResult.status,
      executionTimeMs: judgeResult.executionTimeMs || 0,
      passedTestCases: judgeResult.passedTestCases || 0,
      totalTestCases: judgeResult.totalTestCases || problem.testCases.length,
      output: judgeResult.error || '',
    });

    // Update problem + user stats
    problem.totalSubmissions += 1;
    if (judgeResult.status === 'Accepted') problem.acceptedSubmissions += 1;
    await problem.save();

    if (judgeResult.status === 'Accepted') {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { solvedProblems: problem._id } });
    }

    // Fire-and-include AI hint only on failure, so success stays fast
    let aiHint = '';
    if (judgeResult.status !== 'Accepted') {
      const failingStderr = judgeResult.results?.find((r) => r.stderr)?.stderr || judgeResult.error || '';
      aiHint = await getAIHint({
        problemTitle: problem.title,
        problemDescription: problem.description,
        code,
        status: judgeResult.status,
        stderr: failingStderr,
      });
      submission.aiHint = aiHint;
      await submission.save();
    }

    res.status(201).json({ submission, judgeResult });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/submissions/mine
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/submissions/problem/:problemId
const getSubmissionsForProblem = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
      problem: req.params.problemId,
    }).sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/submissions/:id
const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('problem', 'title slug');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (String(submission.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }
    res.json({ submission });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSubmission, getMySubmissions, getSubmissionsForProblem, getSubmissionById };
