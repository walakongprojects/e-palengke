const router = require('express').Router();
const https   = require("https");
const fs      = require("fs");
// Get Page Model
const Sales = require('../models/sales');
const Bid = require('../models/bid');
const paypal = require('paypal-rest-sdk')
const moment = require('moment')

const auth = require('../config/auth')


router.get('/', auth.isAdmin, (req, res) => {

  if(req.query.dateFrom && req.query.dateTo){

    var from = req.query.dateFrom
    var to = req.query.dateTo
    var checkDate = false
    if(from < to){

      Sales.find({"date" : {"$gte": new Date(`${from}`), "$lt" : new Date(`${to}`) }, "paid":true }, (err, foundSales) => {
        if(err)
          throw(err);
        console.log(foundSales)
        checkDate = true
        res.render('admin/all_sales', {
          sales: foundSales,
          from,
          to,
          checkDate
        })
      })
    }
    else {
      req.flash('danger', 'Choose valid date')
      res.redirect('/admin/sales')
    }
  } else {

    Sales.find({}).sort({'date': -1}).exec((err, foundSales) => {
      if(err)
        throw(err);
      res.render('admin/all_sales', {
        sales: foundSales,
        checkDate
      })
    })
  }
});

router.get('/sales-report', auth.isAdmin, (req, res) => {

  if(req.query.dateFrom != null && req.query.dateFrom != null){

    var from = req.query.dateFrom
    var to = req.query.dateTo
    var checkDate = false

    
    if(from < to){

      Sales.find({"date" : {"$gte": new Date(`${from}`), "$lt" : new Date(`${to}`) }, "paid":true }, (err, foundSales) => {
        if(err)
          throw(err);
    
        var total = 0
        checkDate = true
        
        foundSales.forEach(sale => {
          // temp = parseFloat(sale.total).toFixed(2)
          if(sale.paid) 
            total += parseFloat(sale.total.toFixed(2))
        })
    
        total = total.toFixed(2)
        
        res.render('admin/sales_report', {
          sales: foundSales,
          total,
          from,
          to,
          checkDate
        })
      })
    }
    else {
      req.flash('danger', 'Choose valid date')
      res.redirect('/admin/sales/sales-report')
    }
  } else {

    Sales.find({}, (err, foundSales) => {
      if(err)
        throw(err);
  
      var total = 0
      var temp= 0
      checkDate = false
      foundSales.forEach(sale => {
        // temp = parseFloat(sale.total).toFixed(2)
        if(sale.paid) 
          total += parseFloat(sale.total.toFixed(2))
      })
  
      total = total.toFixed(2)
      
      res.render('admin/sales_report', {
        sales: foundSales,
        total,
        checkDate
      })
    })
  }
});

router.get('/cancelOrder/:id/:status', async (req, res) => {
  const { id, status } = req.params

  const salesDoc = await Sales.findById(id)
  if (!salesDoc) {
    req.flash('danger', 'Sale document not found.')
    res.redirect('/admin/sales')
  } else {
    console.log(status, 'status')
    if (status === 'reject') {
      salesDoc.cancelStatus = 'Reject'
      await salesDoc.save()

      req.flash('success', 'Cancel order rejected.')
      res.redirect('/admin/sales')
      console.log('2233')
    } else {

      const refund_details = {
        "amount": {
          "currency": "PHP",
          "total": salesDoc.totalWithShipping
        }
      }

      console.log(salesDoc.paypalTransactionId, 'salesDoc.paypalTransactionId')
      // paypal.capture.get(salesDoc.paypalTransactionId, async function (error, data) {
      //    if (error) {
      //     console.log(error)
      //     req.flash('danger', 'Something went wrong when cancelling order')
      //     res.redirect('/admin/sales')
      //   } else {
      //     console.log(data, 'data')
      //     req.flash('success', 'test')
      //     res.redirect('/admin/sales')
      //   }    
      // })
      paypal.capture.refund(salesDoc.paypalTransactionId, refund_details, async function (error, refund) {
        if (error) {
          console.log(error)
          req.flash('danger', 'Something went wrong when cancelling order')
          res.redirect('/admin/sales')
        } else {
          console.log(refund, 'refund')
          salesDoc.cancelStatus = 'Approved'
          await salesDoc.save()

          req.flash('success', 'Cancel order successfully approved')
          res.redirect('/admin/sales')
        }
      })
    }
  }
})

router.post('/deliveryStatus/:id', async (req, res) => {
  const { id } = req.params
  
  console.log(req.body, 'req.body')
  const salesDoc = await Sales.findById(id)
  if (!salesDoc) {
    req.flash('danger', 'Sales document does not exist.')
    res.redirect('/admin/sales')
  } else {
    const { status } = req.body
    const obj = {}
    let currentStatus = status 

    switch (currentStatus) {
      case 'Packing':
        obj.text = 'Shop is packing your order.'
        obj.date = moment().format('YYYY-MM-DD')
        obj.status = currentStatus
        break;
      case 'On Delivery':
        obj.text = 'Your order is on the way. Please prepare exact amount.'
        obj.date = moment().format('YYYY-MM-DD')
        obj.status = currentStatus
        break;
      case 'Delivered':
        obj.text = 'Your order is delivered.'
        obj.date = moment().format('YYYY-MM-DD')
        obj.status = currentStatus
        break;
    }

    const newDeliveryStatus = salesDoc.deliveryStatus
    newDeliveryStatus.push(obj)

    salesDoc.deliveryStatus = newDeliveryStatus
    salesDoc.currentDeliveryStatus = currentStatus
    if (currentStatus === 'Delivered') {
      salesDoc.isDelivered = true
    }
    if (currentStatus === 'Packing') {
      const [month, day, year] = req.body.date.split('/')
      salesDoc.estimatedDate = moment(`${year}-${month}-${day}`).format('YYYY-MM-DD')
    }
    await salesDoc.save()
    req.flash('success', 'Successfully update delivery status.')
    res.redirect('/admin/sales')
  }
})

router.get('/:id', auth.isAdmin, (req, res) => {

  var id = req.params.id;
  Sales.findById(id, (err, foundSales) => {
    if(err)
      throw(err);
    res.render('admin/sale', {
      sales: foundSales,
      arrSales: foundSales.product
    })
  })
 
});

router.get('/:id/show-invoice', auth.isAdmin, (req, res) => {

var id = req.params.id

  Sales.findById(id)
    .then(foundSale => {
      var filePath = `/files/invoice-${foundSale._id}.pdf`;
      fs.readFile(__dirname + filePath , function (err,data){
          res.contentType("application/pdf");
          res.send(data);
      });
    })
    .catch(err => console.log(err))
})

router.post('/:id/delivered', auth.isAdmin, (req, res) => {

  var id = req.params.id;

  Sales.updateOne({_id: id}, {$set: {"isDelivered": true}})
    .then(updatedProduct => {
      
      req.flash('success', 'Successfully updated transaction to "Delivered"');
      res.redirect(`/admin/sales/${id}`)
    })
    .catch(err => console.log(err))

});

router.post('/:id/paid', auth.isAdmin, async (req, res) => {

  const id = req.params.id;

  try {
    const salesDoc = await Sales.findById(id)
    salesDoc.paid = true
    await salesDoc.save()

    const updateQueries = []
    for (const product of salesDoc.product) {
      if (product.bidId) {
        updateQueries.push({
          updateOne: {
            filter: { _id: product.bidId },
            update: {
              $set: {
                isPaid: true
              }
            }
          }
        })
      }
    }

    if (updateQueries.length) {
      await Bid.bulkWrite(updateQueries)
    }

    req.flash('success', 'Successfully updated transaction to "Paid"');
    res.redirect(`/admin/sales/${id}`)
  } catch(error) {
    console.log(error)
  }

  // Sales.updateOne({_id: id}, {$set: {"paid": true}}, { returnOriginal: false })
  //   .then(async (updatedProduct) => {
  //     console.log(updatedProduct, 'updatedProduct')
  //     console.log(updatedProduct.product, 'updatedProduct.product')

  //     for (const product of updatedProduct.product) {
  //       if (product.bidId) {
  //         updateQueries.push({
  //           updateOne: {
  //             filter: { _id: product.bidId },
  //             update: {
  //               $set: {
  //                 isPaid: true
  //               }
  //             }
  //           }
  //         })
  //       }
  //     }

  //     if (updateQueries.length) {
  //       await Bid.bulkWrite(updateQueries)
  //     }
      
  //     req.flash('success', 'Successfully updated transaction to "Paid"');
  //     res.redirect(`/admin/sales/${id}`)
  //   })
  //   .catch(err => console.log(err))

});


module.exports = router;