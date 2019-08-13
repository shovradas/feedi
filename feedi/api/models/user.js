const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, //Does not validate, only used for optimization purpose
        match:  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
    },
    password: { type: String, required: true },
    securityPIN: { type: String, required: true },
    registrationDate: { type: Date, required: true }
});

module.exports = mongoose.model('User', userSchema);