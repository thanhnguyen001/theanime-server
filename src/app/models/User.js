const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    email: { type: String, required: true, unique: true},
    username: { type: String, required: true, unique: true},
    displayName: { type: String },
    password: { type: String, required: true},
    gender: {type: String, required: true},
    following: {type: Array},
    avatar: {type: String },
    liked: {type: Array},
    viewed: {type: Array},
},{
    timestamps: true,
});

module.exports = mongoose.model('users', User);