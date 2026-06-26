const express = require('express');
const questionController = require('../controllers/questionController');

const router = express.Router();

const authenticate = require('../authenticate');

// GET /questions
router.get('/', questionController.listQuestions);

// GET /questions/:questionId
router.get('/:questionId', questionController.getQuestion);

// POST /questions
router.post('/', authenticate.verifyUser, authenticate.verifyAdmin, questionController.createQuestion);

// PUT /questions/:questionId
router.put('/:questionId', authenticate.verifyUser, authenticate.verifyAdmin, questionController.updateQuestion);

// DELETE /questions/:questionId
router.delete('/:questionId', authenticate.verifyUser, authenticate.verifyAdmin, questionController.deleteQuestion);

module.exports = router;
