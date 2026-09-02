const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/leaderboard', getLeaderboard);
router.put('/me', protect, updateProfile);
router.get('/:username', getUserProfile);

module.exports = router;
