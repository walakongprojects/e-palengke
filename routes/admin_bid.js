const router = require('express').Router();

const Bid = require('../models/bid');

// router.get('/', auth.allAdmin, (req, res) => {
router.get('/', async (req, res) => {
	const bidDocs = await Bid.find({}).populate([ 'user', 'productId' ]).exec()

	res.render('admin/bids', { bids: bidDocs })
});

module.exports = router;