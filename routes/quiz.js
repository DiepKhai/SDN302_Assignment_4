const express = require('express');
const router = express.Router();
const https = require('https');
const axios = require('axios');

const axiosInstance = axios.create({
	httpsAgent: new https.Agent({ rejectUnauthorized: false }),
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

// GET /quizzes - list
router.get('/', async (req, res) => {
	try {
		const response = await requestWithFallback(
			{ method: 'GET', url: `${apiUrl}/quizzes` },
			[`${apiUrl}/quiz`]
		);
		res.render('quiz/list.ejs', {
			title: 'Quizzes',
			apiUrl,
			quizzes: response.data || [],
            error: req.query.error,
		});
	} catch (err) {
		const { msg } = extractApiError(err);
		res.render('quiz/list.ejs', {
			title: 'Quizzes',
			apiUrl,
			quizzes: [],
			error: `Cannot load quizzes from API: ${msg}`,
		});
	}
});

// GET /quizzes/create - form
router.get('/create', (req, res) => {
	res.render('quiz/create.ejs', {
		title: 'Create New Quiz',
		apiUrl,
		form: { title: '', description: '' },
	});
});

// POST /quizzes - create
router.post('/', async (req, res) => {
	try {
		const payload = {
			title: String(req.body.title || '').trim(),
			description: String(req.body.description || '').trim(),
		};
		await requestWithFallback(
			{ method: 'POST', url: `${apiUrl}/quizzes`, data: payload },
			[`${apiUrl}/quiz`]
		);
		res.redirect('/quizzes');
	} catch (err) {
		const { msg } = extractApiError(err);
		res.status(400).render('quiz/create.ejs', {
			title: 'Create New Quiz',
			apiUrl,
			error: msg,
			form: { title: req.body.title || '', description: req.body.description || '' },
		});
	}
});

// GET /quizzes/:id - details
router.get('/:id', async (req, res) => {
	const { id } = req.params;
	const keyword = String(req.query.keyword || '').trim();
	const qs = new URLSearchParams();
	if (keyword) qs.set('keyword', keyword);
	qs.set('populate', 'true');

	try {
		const response = await requestWithFallback(
			{ method: 'GET', url: `${apiUrl}/quizzes/${id}?${qs.toString()}` },
			[`${apiUrl}/quiz/${id}?${qs.toString()}`]
		);

		const quiz = response.data || {};
		const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

		res.render('quiz/details.ejs', {
			title: 'Quiz Details',
			apiUrl,
			quiz,
			questions,
			keyword,
			addQuestionForm: { text: '', options: '', keywords: '', correctAnswerIndex: '' },
			manyError: req.query.manyError || '',
			manySuccess: req.query.manySuccess || '',
			manyJson: req.query.manyJson || '',
		});
	} catch (err) {
		const { status, msg } = extractApiError(err);
		res.status(status || 500).send(`Cannot load quiz: ${msg}`);
	}
});

// GET /quizzes/:id/edit - edit form
router.get('/:id/edit', async (req, res) => {
	const { id } = req.params;
	try {
		const response = await requestWithFallback(
			{ method: 'GET', url: `${apiUrl}/quizzes/${id}?populate=true` },
			[`${apiUrl}/quiz/${id}?populate=true`]
		);
		const quiz = response.data || {};
		res.render('quiz/edit.ejs', {
			title: 'Edit Quiz',
			apiUrl,
			quiz,
			form: { title: quiz.title || '', description: quiz.description || '' },
		});
	} catch (err) {
		const { status, msg } = extractApiError(err);
		res.status(status || 500).send(`Cannot load quiz for edit: ${msg}`);
	}
});

// PUT /quizzes/:id - update
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const payload = {
			title: String(req.body.title || '').trim(),
			description: String(req.body.description || '').trim(),
		};
		await requestWithFallback(
			{ method: 'PUT', url: `${apiUrl}/quizzes/${id}`, data: payload },
			[`${apiUrl}/quiz/${id}`]
		);
		res.redirect(`/quizzes/${id}`);
	} catch (err) {
		const { msg } = extractApiError(err);
		res.status(400).render('quiz/edit.ejs', {
			title: 'Edit Quiz',
			apiUrl,
			error: msg,
			quiz: { _id: id },
			form: { title: req.body.title || '', description: req.body.description || '' },
		});
	}
});

// POST /quizzes/:id/question
router.post('/:id/question', async (req, res) => {
	const { id } = req.params;
	const keyword = String(req.query.keyword || '').trim();
	const payload = normalizeQuestionPayload(req.body);

	try {
		await requestWithFallback(
			{ method: 'POST', url: `${apiUrl}/quizzes/${id}/question`, data: payload },
			[`${apiUrl}/quiz/${id}/question`]
		);
		const suffix = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
		res.redirect(`/quizzes/${id}${suffix}`);
	} catch (err) {
		const { msg } = extractApiError(err);
		res.status(400).send(`Cannot add question to quiz: ${msg}`);
	}
});

// POST /quizzes/:id/questions
router.post('/:id/questions', async (req, res) => {
	const { id } = req.params;
	const rawJson = String(req.body.questionsJson || '').trim();

	let questions;
	try {
		questions = JSON.parse(rawJson);
		if (!Array.isArray(questions)) throw new Error('Input must be a JSON array.');
	} catch (parseErr) {
		return res.status(400).redirect(`/quizzes/${id}?manyError=${encodeURIComponent('Invalid JSON: ' + parseErr.message)}&manyJson=${encodeURIComponent(rawJson)}`);
	}

	try {
		await requestWithFallback(
			{ method: 'POST', url: `${apiUrl}/quizzes/${id}/questions`, data: questions }
		);
		res.redirect(`/quizzes/${id}?manySuccess=${encodeURIComponent(`${questions.length} question(s) added successfully.`)}`);
	} catch (err) {
		const { msg } = extractApiError(err);
		res.redirect(`/quizzes/${id}?manyError=${encodeURIComponent('API error: ' + msg)}&manyJson=${encodeURIComponent(rawJson)}`);
	}
});

// DELETE /quizzes/:id 
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	try {
		await requestWithFallback(
			{ method: 'DELETE', url: `${apiUrl}/quizzes/${id}` },
			[`${apiUrl}/quiz/${id}`]
		);
		res.redirect('/quizzes');
	} catch (err) {
		const { msg } = extractApiError(err);
        res.redirect(`/quizzes?error=${encodeURIComponent('Cannot delete quiz: ' + msg)}`);
	}
});

module.exports = router;
