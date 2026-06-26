const mongoose = require('mongoose');
const Question = require('../models/question');
const Quiz = require('../models/quiz');

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

exports.listQuestions = async (req, res, next) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        next(err);
    }
};

exports.createQuestion = async (req, res, next) => {
    try {
        if (req.user) {
            req.body.author = req.user._id;
        }
        const question = await Question.create(req.body);
        res.status(201).json(question);
    } catch (err) {
        next(err);
    }
};

exports.getQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        if (!isValidObjectId(questionId)) return res.status(400).json({ error: 'Invalid questionId' });

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ error: 'Question not found' });

        res.json(question);
    } catch (err) {
        next(err);
    }
};

exports.updateQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        if (!isValidObjectId(questionId)) return res.status(400).json({ error: 'Invalid questionId' });

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ error: 'Question not found' });

        const { text, options, keywords, correctAnswerIndex } = req.body;

        if (typeof text !== 'undefined') question.text = text;
        if (typeof options !== 'undefined') question.options = options;
        if (typeof keywords !== 'undefined') question.keywords = keywords;
        if (typeof correctAnswerIndex !== 'undefined') question.correctAnswerIndex = correctAnswerIndex;

        await question.save();
        res.json(question);
    } catch (err) {
        next(err);
    }
};

exports.deleteQuestion = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        if (!isValidObjectId(questionId)) return res.status(400).json({ error: 'Invalid questionId' });

        const deleted = await Question.findByIdAndDelete(questionId);
        if (!deleted) return res.status(404).json({ error: 'Question not found' });

        // Keep quizzes consistent (remove dangling refs)
        await Quiz.updateMany({ questions: deleted._id }, { $pull: { questions: deleted._id } });

        res.json(deleted);
    } catch (err) {
        next(err);
    }
};
