const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const account = require('./account');
const transaction = require('./transaction');

router.post('/register', userController.register);
router.get('/login', userController.login);
router.post('/verify', userController.verify);

router.use('/accounts', account);
router.get('/transactions', transaction);

module.exports = router
