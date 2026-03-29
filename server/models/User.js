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

// Создаем отдельную модель для истории веса
const WeightHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    weight: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('User', UserSchema);

// Создаем отдельную модель для истории веса
const WeightHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    weight: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('User', UserSchema); 