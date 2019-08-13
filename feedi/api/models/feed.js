const mongoose = require('mongoose');


const feedSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    discoveredAt: { type: String, required: true },
    type: { type: String, required: true },
    version: { type: String, required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    updated: { type: Date, required: true },
    published: { type: Date, required: true },
    discovered: { type: Date, required: true },
    retrieved: { type: Date, required: true },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Feed', feedSchema);