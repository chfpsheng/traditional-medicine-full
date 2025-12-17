const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['偏方', '验方']
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  },
  treatmentMethod: {
    type: String,
    required: true,
    enum: ['方剂', '针', '艾灸', '推拿', '丸剂', '散剂', '熏洗']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);