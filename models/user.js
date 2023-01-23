const mongoose = require('mongoose');

// creating schema for user

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String, 
        required: true
    },
}, {
    timestamps: true
});


// creating a model of userSchema

const User = new mongoose.model('User', userSchema);

module.exports = User;