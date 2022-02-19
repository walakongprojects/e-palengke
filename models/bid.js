const mongoose = require('mongoose');
const moment = require('moment')

const bidSchema = mongoose.Schema({
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product'
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	price: {
		type: Number,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	selected: {
		type: Boolean,
		default: false
	},
	bidPlacedDate: {
		type: Date,
		default: moment()
	},
	isPaid: {
		type: Boolean,
		default: false
	}
})

module.exports = mongoose.model('Bid', bidSchema);