const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,     
    title: { type: String, required: true },
    link: { type: String, required: true },
    updated: { type: Date, required: true },
    published: { type: Date, required: true },
    discovered: { type: Date, required: true },
    isFavourite: { type: Boolean, required: true },
    isRead: { type: Boolean, required: true },
    retrieved: { type: Date, required: true },
    feed: {type: mongoose.Schema.Types.ObjectId, ref: 'Feed', required: true }
});

module.exports = mongoose.model('Entry', entrySchema);