const router = require('express').Router();
const fs = require('fs-extra');

// Product Model
const Product = require('../models/products');
// Category Model
const Category = require('../models/category');
const Bid = require('../models/bid');


// Get all products
router.get('/', (req, res) => {

  Product.find({}, (err, foundProducts) => {
    if(err) throw(err);
    res.render('all_products', {
      title: 'All Products',
      products: foundProducts
    })
    
  });
});

// Get all products on a category
router.get('/:category', (req, res) => {

  var categorySlug = req.params.category;

  Category.findOne({slug: categorySlug}, (err, foundCategory) => {
    if(err)
      throw(err);   
    Product.find({category: categorySlug}, (err, foundProducts) => {
      if(err) 
        throw(err);
      res.render('category_products', {
        title: foundCategory.title,
        products: foundProducts
      });      
    });
  })

});

// Get all product details
router.get('/:category/:product', (req, res) => {

  var galleryImages = null;
  let userCurrentBid = null;

  Product.findOne({slug: req.params.product}, async (err, foundProduct) => {
    if(err)
      throw(err)

    if (foundProduct.bidders && foundProduct.bidders.length !== 0 && req.user) {
      const [ currentUser ] = foundProduct.bidders.filter(bidder => {
        if (bidder.toString() === req.user._id.toString()) {
          return req.user._id
        }
      })
      if (currentUser) {
        userCurrentBid = await Bid.findOne({
          productId: foundProduct._id,
          user: req.user._id
        }).populate('user').exec()
      }
    }
    
    var galleryDir = `public/product_images/${foundProduct._id}/gallery`;

    fs.readdir(galleryDir, (err, files) => {
      if(err)
        throw(err)
      
      Product.find({})
        .then(foundProducts => {
          res.render('product', {
            title: foundProduct.title,
            product: foundProduct,
            galleryImages: galleryImages,
            userCurrentBid,
            products: foundProducts,
          })
        })
        .catch(err => console.log(err))
      galleryImages = files;
    });

  });
});


module.exports = router;