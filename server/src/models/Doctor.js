const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    clinicName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    specialize: {
      type: String,
      required: true
    },
    introduction: {
      type: String,
      maxlength: 256,
      default: ''
    },
    lng: {
      type: Number,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
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
  }
);

module.exports = mongoose.model('Doctor', DoctorSchema);