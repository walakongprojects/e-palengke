const router = require('express').Router();

const Bid = require('../models/bid');

// router.get('/', auth.allAdmin, (req, res) => {
console.log('test')
router.get('/', async (req, res) => {
	const bidDocs = await Bid.find({}).populate([ 'user', 'productId' ]).exec()

	res.render('admin/bids', { bids: bidDocs })
});

router.get('/approve/:id', async (req, res) => {
	try {
		const { id } = req.params
		const bidDoc = await Bid.findById(id).populate(['productId', 'user']).exec()
		if (!bidDoc) {
			throw('There is no bid document found.')
		}

		bidDoc.selected = true
		await bidDoc.save()
		const bidDocs = await Bid.find({}).populate([ 'user', 'productId' ]).exec()
		req.flash('success', 'Bid successfully approve.');
		res.render('admin/bids', { bids: bidDocs })
	} catch (error) {
		req.flash('danger', 'Something went wrong when approvng the bid');
		throw (error)
	}
})

module.exports = router;