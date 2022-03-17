const mongoose = require('mongoose');

const history = {
  status: {
    type: String,
    enum: [
      'Pending',
      'Packing',
      'On Delivery',
      'Delivered'
    ]
  },
  date: {
    type: Date
  },
  text: {
    type: String
  }
}

var saleSchema = mongoose.Schema({
  product: [],
  date: {
    type: Date,
    default: Date.now()
  },
  total: Number,
  buyer: {
    type: String,
    required: true
  }, 
  buyerName: {
    type: String
  },
  phone_number: {
    type: String
  },
  paid: {
    type: Boolean,
    default: false
  },
  buyerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  address: {
    type: String
  },
  invoiceSaved: {
    type: Boolean,
    default: false
  },
  shipping_fee: {
    type: Number,
    default: 100
  },
  paypalTransactionId: {
    type: String
  },
  payerId: {
    type: String
  },
  cancelReason: {
    type: String
  },
  cancelStatus: {
    type: String,
    enum: [
      '',
      'Pending',
      'Approved',
      'Reject'
    ],
    default: ''
  },
  totalWithShipping: Number,
  deliveryStatus: {
    type: [ history ],
  },
  currentDeliveryStatus: {
    type: String,
    enum: [
      'Pending',
      'Packing',
      'On Delivery',
      'Delivered'
    ]
  },
  estimatedDate: {
    type: Date
  }
});

module.exports = mongoose.model('Sale', saleSchema);