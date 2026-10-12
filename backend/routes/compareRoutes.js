const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { compare } = require('../controllers/compareController');

router.post('/compare', upload.single('resume'), compare);

module.exports = router;
