const express = require('express');
const router = express.Router();
const { login, init } = require('../controllers/authController');
router.post('/login', login);
router.post('/init', init);
module.exports = router;