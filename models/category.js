const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: String,
  
}, { autoCreate: true });

module.exports = mongoose.model('Category', categorySchema);