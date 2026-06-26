const express = require('express');
const quizController = require('../controllers/quizController');

const router = express.Router();

const authenticate = require('../authenticate');

// GET /quizzes (populate questions)
router.get('/', quizController.listQuizzes);

// POST /quizzes
router.post('/', authenticate.verifyUser, authenticate.verifyAdmin, quizController.createQuiz);

// GET /quizzes/:quizId (raw quiz)
router.get('/:quizId', quizController.getQuiz);

// GET /quizzes/:quizId/populate?keyword=capital
router.get('/:quizId/populate', quizController.getQuizPopulated);

// POST /quizzes/:quizId/question (add single)
router.post('/:quizId/question', authenticate.verifyUser, authenticate.verifyAdmin, quizController.addQuestionToQuiz);

// POST /quizzes/:quizId/questions (add many)
router.post('/:quizId/questions', authenticate.verifyUser, authenticate.verifyAdmin, quizController.addManyQuestionsToQuiz);

// PUT /quizzes/:quizId
router.put('/:quizId', authenticate.verifyUser, authenticate.verifyAdmin, quizController.updateQuiz);

// DELETE /quizzes/:quizId
router.delete('/:quizId', authenticate.verifyUser, authenticate.verifyAdmin, quizController.deleteQuiz);

module.exports = router;
