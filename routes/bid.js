const router = require('express').Router();

const Product = require('../models/products')
const Bid = require('../models/bid')
const User = require('../models/user')
const fs = require('fs')

router.get('/test', (req, res) => {
	res.send('test route for bid')
})

router.get('/', async (req, res) => {
	const bidDocs = await Bid.find().populate('productId', 'user').exec()
	res.json({ result: bidDocs })
})

router.get('/:_bidId', async (req, res) => {
	const { _bidId } = req.params
	const bidDoc = await Bid.findById({ _id: _bidId})
})

router.post('/', async (req, res) => {
	try {
		const { price, quantity } = req.body
		const productDoc = await Product.findById(req.body.productId)
		const userDoc = await User.findById(req.user._id)

		if (!productDoc || !userDoc) {
			throw('There is no product found.')
		}

		const createdBidDoc = await Bid.create({
			price,
			quantity,
			user: userDoc._id,
			productId: productDoc._id,
		})

		await Product.findOneAndUpdate(
			{
				_id: productDoc._id
			},
			{
				$push: {
					bidders: userDoc._id
				}
			}
		)

		await User.findOneAndUpdate (
			{
				_id: userDoc._id
			},
			{
				$push: {
					bids: createdBidDoc._id
				}
			}
		)

		req.flash('success', 'Successfully bid to product.');
		res.redirect(`/products/${productDoc.category}/${productDoc.slug}`)
	} catch(err) {
		throw(err)
	}
})



router.post('/edit/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { price, quantity } = req.body
		const productDoc = await Product.findById(req.body.productId)
		const userDoc = await User.findById(req.user._id)

		if (!productDoc || !userDoc) {
			throw('There is no product found.')
		}

		await Bid.findOneAndUpdate(
			{
				_id: id
			},
			{
				$set: {
					price,
					quantity
				}
			}
		)

		req.flash('success', 'Successfully update the bid in product.');
		res.redirect(`/products/${productDoc.category}/${productDoc.slug}`)
	} catch(err) {
		req.flash('danger', 'Something went wrong when editing the bid');
		throw(err)
	}

})

router.post('/delete/:id', async (req, res) => {
	try {
		const { id } = req.params
		const bidDoc = await Bid.findById(id)
		const productDoc = await Product.findById(bidDoc.productId)
		const userDoc = await User.findById(req.user._id)

		if (!productDoc || !userDoc) {
			throw('There is no product found.')
		}

		await Bid.findOneAndDelete(
			{
				_id: id
			},
		)

		await Product.findOneAndUpdate(
			{
				_id: productDoc._id
			},
			{
				$pull: {
					bidders: userDoc._id
				}
			}
		)

		await User.findOneAndUpdate (
			{
				_id: userDoc._id
			},
			{
				$pull: {
					bids: productDoc._id
				}
			}
		)

		req.flash('success', 'Successfully cancelled the bid in product.');
		res.redirect(`/products/${productDoc.category}/${productDoc.slug}`)
	} catch(err) {
		throw(err)
	}

})



module.exports = router;