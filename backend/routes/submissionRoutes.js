const express = require('express');
const router = express.Router();
const {
  createSubmission, getMySubmissions, getSubmissionsForProblem, getSubmissionById,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createSubmission);
router.get('/mine', protect, getMySubmissions);
router.get('/problem/:problemId', protect, getSubmissionsForProblem);
router.get('/:id', protect, getSubmissionById);

module.exports = router;
