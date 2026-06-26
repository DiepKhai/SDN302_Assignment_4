const express = require('express');
const router = express.Router();
const https = require('https');
const axios = require('axios');

const axiosInstance = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

const apiUrl = 'http://localhost:3001/api';

async function requestWithFallback(config, fallbackPaths = []) {
    const pathsToTry = [config.url, ...fallbackPaths];
    let lastErr;
    for (const url of pathsToTry) {
        try {
            const res = await axiosInstance.request({ ...config, url });
            return res;
        } catch (err) {
            lastErr = err;
            const status = err && err.response && err.response.status;
            if (status && status !== 404) break;
        }
    }
    throw lastErr;
}

function splitCsv(value) {
    return String(value || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function normalizeQuestionPayload(body) {
    return {
        text: String(body.text || '').trim(),
        options: splitCsv(body.options),
        keywords: splitCsv(body.keywords),
        correctAnswerIndex: Number.parseInt(body.correctAnswerIndex, 10),
    };
}

function extractApiError(err) {
    const status = err && err.response && err.response.status;
    const msg =
        (err && err.response && err.response.data && (err.response.data.error || err.response.data.message)) ||
        (err && err.message && err.message.trim()) ||
        (err && err.cause && err.cause.message && err.cause.message.trim()) ||
        (err && err.code) ||
        'Unknown error';
    return { status, msg };
}

// GET /questions
router.get('/', async (req, res) => {
    try {
        const response = await requestWithFallback(
            { method: 'GET', url: `${apiUrl}/questions` },
            [`${apiUrl}/question`]
        );
        res.render('questions/list.ejs', {
            title: 'Questions',
            questions: response.data || [],
            apiUrl,
            error: req.query.error,
        });
    } catch (err) {
        const { msg } = extractApiError(err);
        res.render('questions/list.ejs', {
            title: 'Questions',
            questions: [],
            apiUrl,
            error: `Cannot load questions from API: ${msg}`,
        });
    }
});

// GET /questions/create
router.get('/create', (req, res) => {
    res.render('questions/create.ejs', {
        title: 'Create New Question',
        apiUrl,
        form: { text: '', options: '', keywords: '', correctAnswerIndex: '' },
    });
});

// POST /questions
router.post('/', async (req, res) => {
    const payload = normalizeQuestionPayload(req.body);
    try {
        await requestWithFallback(
            { method: 'POST', url: `${apiUrl}/questions`, data: payload },
            [`${apiUrl}/question`]
        );
        res.redirect('/questions');
    } catch (err) {
        const { msg } = extractApiError(err);
        res.status(400).render('questions/create.ejs', {
            title: 'Create New Question',
            apiUrl,
            error: msg,
            form: {
                text: req.body.text || '',
                options: req.body.options || '',
                keywords: req.body.keywords || '',
                correctAnswerIndex: req.body.correctAnswerIndex || '',
            },
        });
    }
});

// GET /questions/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await requestWithFallback(
            { method: 'GET', url: `${apiUrl}/questions/${id}` },
            [`${apiUrl}/question/${id}`]
        );
        res.render('questions/details.ejs', {
            title: 'Question Details',
            apiUrl,
            question: response.data,
        });
    } catch (err) {
        const { status, msg } = extractApiError(err);
        res.status(status || 500).send(`Cannot load question: ${msg}`);
    }
});

// GET /questions/:id/edit
router.get('/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await requestWithFallback(
            { method: 'GET', url: `${apiUrl}/questions/${id}` },
            [`${apiUrl}/question/${id}`]
        );
        const q = response.data || {};
        res.render('questions/edit.ejs', {
            title: 'Edit Question',
            apiUrl,
            question: q,
            form: {
                text: q.text || '',
                options: Array.isArray(q.options) ? q.options.join(', ') : (q.options || ''),
                keywords: Array.isArray(q.keywords) ? q.keywords.join(', ') : (q.keywords || ''),
                correctAnswerIndex:
                    typeof q.correctAnswerIndex === 'number' ? String(q.correctAnswerIndex) : (q.correctAnswerIndex || ''),
            },
        });
    } catch (err) {
        const { status, msg } = extractApiError(err);
        res.status(status || 500).send(`Cannot load question for edit: ${msg}`);
    }
});

// PUT /questions/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const payload = normalizeQuestionPayload(req.body);
    try {
        await requestWithFallback(
            { method: 'PUT', url: `${apiUrl}/questions/${id}`, data: payload },
            [`${apiUrl}/question/${id}`]
        );
        res.redirect(`/questions/${id}`);
    } catch (err) {
        const { msg } = extractApiError(err);
        res.status(400).render('questions/edit.ejs', {
            title: 'Edit Question',
            apiUrl,
            error: msg,
            question: { _id: id },
            form: {
                text: req.body.text || '',
                options: req.body.options || '',
                keywords: req.body.keywords || '',
                correctAnswerIndex: req.body.correctAnswerIndex || '',
            },
        });
    }
});

// DELETE /questions/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await requestWithFallback(
            { method: 'DELETE', url: `${apiUrl}/questions/${id}` },
            [`${apiUrl}/question/${id}`]
        );
        res.redirect('/questions');
    } catch (err) {
        const { msg } = extractApiError(err);
        res.redirect(`/questions?error=${encodeURIComponent('Cannot delete question: ' + msg)}`);
    }
});

module.exports = router;