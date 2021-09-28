const express = require('express');
const router = express.Router();
const userController = require('../app/controller/userController');
const verifyToken = require('../app/middleware/auth');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.patch('/update-avatar',verifyToken, userController.updateAvatar);
router.patch('/update',verifyToken, userController.updateUser);
router.put('/action',verifyToken, userController.updateAction)
router.get('/action',verifyToken, userController.getAction)
router.get('/:id', verifyToken, userController.getUser)

module.exports = router;
