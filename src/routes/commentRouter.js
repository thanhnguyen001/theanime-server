const express = require('express');
const router = express.Router();
const commentController = require('../app/controller/commentController');
const verifyToken = require('../app/middleware/auth');

router.post('/:animeId/:commentId',verifyToken, commentController.postCommentLv2);
router.post('/:animeId',verifyToken, commentController.postComment);
router.get('/:animeId/:commentId', commentController.getCommentLevel2)
router.get('/:animeId', commentController.getComment)


module.exports = router;