const Problem = require('../models/Problem');

const slugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// @route GET /api/problems  (list, with search/filter/pagination)
const getProblems = async (req, res, next) => {
  try {
    const { search, difficulty, tag, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };
    if (difficulty) query.difficulty = difficulty;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select('title slug difficulty tags totalSubmissions acceptedSubmissions createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Problem.countDocuments(query),
    ]);

    res.json({ problems, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/problems/:slug
const getProblemBySlug = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Only expose sample test cases to non-admins
    const isAdmin = req.user && req.user.role === 'admin';
    const payload = problem.toObject();
    if (!isAdmin) {
      payload.testCases = payload.testCases.filter((tc) => tc.isSample);
    }
    res.json({ problem: payload });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/problems  (admin)
const createProblem = async (req, res, next) => {
  try {
    const { title, description, difficulty, tags, constraints, testCases, timeLimitMs, memoryLimitMb } = req.body;
    if (!title || !description || !testCases || testCases.length === 0) {
      return res.status(400).json({ message: 'Title, description and at least one test case are required' });
    }
    let slug = slugify(title);
    const existing = await Problem.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const problem = await Problem.create({
      title,
      slug,
      description,
      difficulty,
      tags,
      constraints,
      testCases,
      timeLimitMs,
      memoryLimitMb,
      createdBy: req.user._id,
    });
    res.status(201).json({ problem });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/problems/:id  (admin)
const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const updatable = [
      'title', 'description', 'difficulty', 'tags', 'constraints',
      'testCases', 'timeLimitMs', 'memoryLimitMb', 'isPublished',
    ];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) problem[field] = req.body[field];
    });
    if (req.body.title) problem.slug = slugify(req.body.title);

    await problem.save();
    res.json({ problem });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/problems/:id  (admin)
const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem };
