const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

const mongoose = require('mongoose');

// Backend API Routes
const apiQuizRoutes = require('./routes/quizzes');
const apiQuestionRoutes = require('./routes/questions');
const apiUserRoutes = require('./routes/users');

app.use('/api/quizzes', apiQuizRoutes);
app.use('/api/questions', apiQuestionRoutes);
app.use('/api/users', apiUserRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/SimpleQuiz?retryWrites=false';

async function start() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('MongoDB Connected');
        app.listen(3001, () => {
            console.log('Server is running on port 3001 (API)');
        });
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

start();