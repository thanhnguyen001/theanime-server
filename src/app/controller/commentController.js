const Comment = require('../models/Comment');
const CmtLevel2 = require('../models/CmtLevel2');
const handleErrors = require('../../errors/errors');

class commentController {

    // [GET] /comment/:animeId/
    async getComment(req, res, next) {
        try {
            const { animeId } = req.params;

            let comment = await Comment.find({ animeId })
                .populate({ path: 'user', select: ['avatar', 'displayName'] })
                .sort('-createdAt');
            if (!comment) {
                comment = [];
            }

            res.json({ success: true, comment });
        } catch (error) {
            console.log(error)
            handleErrors(req, res, 404, error.message);
        }
    }


    // [POST] /comment/:animeId
    async postComment(req, res, next) {
        try {
            const { animeId } = req.params;
            const { content } = req.body;

            const newComment = new Comment({
                user: req.userId,
                animeId,
                content
            })

            let comment = await newComment.save();
            const commentId = comment._id;
            comment = await Comment.find({ animeId, _id: commentId })
                .populate({ path: 'user', select: ['avatar', 'displayName'] })

            res.json({ success: true, comment });
        } catch (error) {
            console.log(error)
            handleErrors(req, res, 404, error.message);
        }
    }
    // [POST] /comment/:animeId/:commentId
    async postCommentLv2(req, res, next) {
        try {
            const { animeId, commentId } = req.params;
            const { content } = req.body;

            let comment = await Comment.findOne({ animeId, _id: commentId });

            if (comment) {
                const newCmtLv2 = new CmtLevel2({
                    user: req.userId,
                    animeId,
                    commentId,
                    content
                });
                let temp = await newCmtLv2.save();
                const cmtLv2Id = temp._id;
                let cmtLv2 = await CmtLevel2.findOne({ _id: cmtLv2Id, commentId, animeId })
                    .populate('user', ['avatar', 'displayName']).exec();
                let temp2 = {...cmtLv2};

                comment = await Comment.findOneAndUpdate({ animeId, _id: commentId }, { $push: { cm_level2: temp2 } });
                comment = await Comment.findOne({ animeId, _id: commentId })
                    .populate({ path: 'user', select: ['avatar', 'displayName'] }).exec();
                res.json({ success: true, comment })
            }
        } catch (error) {
            handleErrors(req, res, 404, error.message);
        }       
    }
    // [GET] /comment/:animeId/:commentId
    async getCommentLevel2(req, res, next) {
        try {
            const { animeId, commentId } = req.params;

            let cm_level2 = await CmtLevel2.find({ animeId, commentId })
                .populate({ path: 'user', select: ['avatar', 'displayName'] })
                .sort('-createdAt')
            if (!cm_level2) cm_level2 = [];
            res.json({ success: true, cm_level2 })

        } catch (error) {
            handleErrors(req, res, 404, error.message);
        }
    }
}

module.exports = new commentController;