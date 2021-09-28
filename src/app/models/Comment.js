const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    animeId: { type: String, require: true },
    content: { type: String },
    cm_level2: { type: Array, default: [] },

}, {
    timestamps: true,
});

module.exports = mongoose.model('comments', Comment);