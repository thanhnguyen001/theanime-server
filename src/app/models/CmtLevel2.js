const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CmtLevel2 = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    animeId: { type: String, required: true},
    commentId: {type: String, required: true},
    content: { type: String, required: true},
}, {
    timestamps: true
});

module.exports = mongoose.model('cmtlevel2s', CmtLevel2);