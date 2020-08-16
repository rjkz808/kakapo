const mongoose = require('mongoose');
const { Schema } = mongoose;

const chantSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  freq: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  times: {
    type: Number,
    required: true,
    default: 1,
  },
  interval: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Chant', chantSchema, 'chants');
