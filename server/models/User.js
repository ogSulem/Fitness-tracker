const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 15,
        max: 100
    },
    weight: {
        type: Number,
        required: true,
        min: 30,
        max: 200
    },
    height: {
        type: Number,
        required: true,
        min: 100,
        max: 250
    },
    weightHistory: [{
        weight: Number,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    // Password reset fields
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema); 