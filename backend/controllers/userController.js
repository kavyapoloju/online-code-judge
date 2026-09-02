const User = require('../models/User');
const Submission = require('../models/Submission');

// @route GET /api/users/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('username solvedProblems rating')
      .sort({ rating: -1 })
      .limit(50);
    const leaderboard = users.map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      solvedCount: u.solvedProblems.length,
      rating: u.rating,
    }));
    res.json({ leaderboard });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/:username
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('username bio solvedProblems rating createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const submissionCount = await Submission.countDocuments({ user: user._id });
    res.json({ user, submissionCount });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/users/me
const updateProfile = async (req, res, next) => {
  try {
    const { bio, username } = req.body;
    if (bio !== undefined) req.user.bio = bio;
    if (username) req.user.username = username;
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard, getUserProfile, updateProfile };
