const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
   
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Number
    },
    phone_number: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        required: true
    },
    barangay: {
        type: String,
        required: true
    },
    city: {
        type: String,
    },
    bought: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sale'
        }
    ],
    bids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bid'
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);


