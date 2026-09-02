const express = require('express');
const router = express.Router();
const {
  getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem,
} = require('../controllers/problemController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getProblems);
router.get('/:slug', getProblemBySlug);
router.post('/', protect, adminOnly, createProblem);
router.put('/:id', protect, adminOnly, updateProblem);
router.delete('/:id', protect, adminOnly, deleteProblem);

module.exports = router;
