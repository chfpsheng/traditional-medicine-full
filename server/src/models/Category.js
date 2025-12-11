const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', CategorySchema);
