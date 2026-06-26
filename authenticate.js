const jwt = require('jsonwebtoken');
const Question = require('./models/question');

exports.verifyUser = function(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'secret_key', (err, user) => {
            if (err) {
                const err = new Error("Invalid token");
                err.status = 403;
                return next(err);
            }
            req.user = user;
            next();
        });
    } else {
        const err = new Error("You are not authenticated!");
        err.status = 401;
        next(err);
    }
};

exports.verifyAdmin = function(req, res, next) {
    if (req.user && req.user.admin) {
        next();
    } else {
        const err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        next(err);
    }
};

exports.verifyAuthor = async function(req, res, next) {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);
        
        if (!question) {
            const err = new Error("Question not found");
            err.status = 404;
            return next(err);
        }
        
        if (question.author && req.user && question.author.toString() === req.user._id.toString()) {
            next();
        } else {
            const err = new Error("You are not the author of this question");
            err.status = 403;
            next(err);
        }
    } catch (err) {
        next(err);
    }
};
