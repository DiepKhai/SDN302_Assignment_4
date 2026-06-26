const express = require('express');
const router = express.Router();

// GET / - Home page (rendered via Handlebars main layout)
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Question Bank Management',
        apiUrl: 'http://localhost:3001/api',
    });
});

module.exports = router;
