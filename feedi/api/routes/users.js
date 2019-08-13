const express = require('express');
const router = express.Router();

const checkAuth = require.main.require('./api/middleware/checkauth');
const UsersController = require.main.require('./api/controllers/users');

router.get('/:userId', checkAuth, UsersController.users_get_user);

router.post('/signup', UsersController.users_signup);

router.post('/login', UsersController.users_login);

router.patch('/change-password', checkAuth, UsersController.users_change_password);

module.exports = router;