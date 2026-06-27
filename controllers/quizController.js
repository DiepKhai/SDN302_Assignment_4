const mongoose = require('mongoose');
const Quiz = require('../models/quiz');
const Question = require('../models/question');

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

exports.listQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find().populate('questions');
        res.json(quizzes);
    } catch (err) {
        next(err);
    }
};

exports.createQuiz = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const quiz = await Quiz.create({ title, description });
        res.status(201).json(quiz);
    } catch (err) {
        next(err);
    }
};

exports.getQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        if (!isValidObjectId(quizId)) return res.status(400).json({ error: 'Invalid quizId' });

        const keyword = (req.query.keyword || '').trim();
        const match = keyword
            ? {
                  $or: [{ text: { $regex: keyword, $options: 'i' } }, { keywords: { $regex: keyword, $options: 'i' } }],
              }
            : undefined;

        const populate = String(req.query.populate || 'true').toLowerCase() !== 'false';

        const quizQuery = Quiz.findById(quizId);
        const quiz = populate
            ? await quizQuery.populate({
                  path: 'questions',
                  match,
              })
            : await quizQuery;
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        res.json(quiz);
    } catch (err) {
        next(err);
    }
};

exports.updateQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        if (!isValidObjectId(quizId)) return res.status(400).json({ error: 'Invalid quizId' });

        const updates = {};
        if (typeof req.body.title !== 'undefined') updates.title = req.body.title;
        if (typeof req.body.description !== 'undefined') updates.description = req.body.description;

        const updated = await Quiz.findByIdAndUpdate(quizId, updates, {
            new: true,
            runValidators: true,
        });

        if (!updated) return res.status(404).json({ error: 'Quiz not found' });
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

exports.getQuizPopulated = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        if (!isValidObjectId(quizId)) return res.status(400).json({ error: 'Invalid quizId' });

        const keyword = (req.query.keyword || '').trim();
        const match = keyword
            ? {
                  $or: [{ text: { $regex: keyword, $options: 'i' } }, { keywords: { $regex: keyword, $options: 'i' } }],
              }
            : undefined;

        const quiz = await Quiz.findById(quizId).populate({
            path: 'questions',
            match,
        });

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        res.json(quiz);
    } catch (err) {
        next(err);
    }
};

exports.addQuestionToQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        if (!isValidObjectId(quizId)) return res.status(400).json({ error: 'Invalid quizId' });

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        let questionId;
        if (req.body.questionId) {
            questionId = req.body.questionId;
            // Optionally verify it exists
            const existingQ = await Question.findById(questionId);
            if (!existingQ) return res.status(404).json({ error: 'Question not found' });
        } else {
            const question = await Question.create(req.body);
            questionId = question._id;
        }
        
        quiz.questions.push(questionId);
        await quiz.save();

        const updated = await Quiz.findById(quizId).populate('questions');
        res.status(201).json(updated);
    } catch (err) {
        next(err);
    }
};

exports.addManyQuestionsToQuiz = async (req, res, next) => {
    try {
        const { quizId } = req.params;
        if (!isValidObjectId(quizId)) return res.status(400).json({ error: 'Invalid quizId' });

        if (!Array.isArray(req.body)) {
            return res.status(400).json({ error: 'Request body must be an array of questions' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const inserted = await Question.insertMany(req.body, { ordered: true });
        const questionIds = inserted.map((q) => q._id);

        quiz.questions.push(...questionIds);
        await quiz.save();

        const updated = await Quiz.findById(quizId).populate('questions');
        res.status(201).json(updated);
    } catch (err) {
        next(err);
    }
};

exports.deleteQuiz = async (req, res, next) => {
    try {
        const quizId = req.params.quizId || req.params.id;
        if (!isValidObjectId(quizId)) return res.status(400).json({ error: 'Invalid quizId' });

        const quiz = await Quiz.findById(quizId).select('questions');
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        const questionIds = (Array.isArray(quiz.questions) ? quiz.questions : []).filter((id) => isValidObjectId(id));

        let deletedQuiz;
        let deletedQuestionsCount = 0;

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            if (questionIds.length) {
                const qRes = await Question.deleteMany({ _id: { $in: questionIds } }).session(session);
                deletedQuestionsCount = qRes.deletedCount || 0;
            }

            deletedQuiz = await Quiz.findByIdAndDelete(quizId).session(session);
            await session.commitTransaction();
        } catch (txErr) {
            await session.abortTransaction().catch(() => undefined);

            // Fallback for MongoDB deployments that don't support transactions (e.g. standalone)
            const msg = String(txErr && txErr.message ? txErr.message : txErr);
            const txNotSupported = msg.includes('Transaction numbers are only allowed') || msg.includes('transactions') || msg.includes('replica set');
            if (!txNotSupported) throw txErr;

            if (questionIds.length) {
                const qRes = await Question.deleteMany({ _id: { $in: questionIds } });
                deletedQuestionsCount = qRes.deletedCount || 0;
            }

            deletedQuiz = await Quiz.findByIdAndDelete(quizId);
        } finally {
            session.endSession();
        }

        if (!deletedQuiz) return res.status(404).json({ error: 'Quiz not found' });

        res.json({ ...deletedQuiz.toObject(), deletedQuestionsCount });
    } catch (err) {
        next(err);
    }
};

exports.removeQuestionFromQuiz = async (req, res, next) => {
    try {
        const { quizId, questionId } = req.params;
        if (!isValidObjectId(quizId) || !isValidObjectId(questionId)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

        quiz.questions = quiz.questions.filter(id => id.toString() !== questionId);
        await quiz.save();

        const updated = await Quiz.findById(quizId).populate('questions');
        res.json(updated);
    } catch (err) {
        next(err);
    }
};
