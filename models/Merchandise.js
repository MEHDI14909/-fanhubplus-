import mongoose from 'mongoose'

const merchandiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  fandom: {
    type: String,
    required: true,
    trim: true
  },
  releaseDate: {
    type: Date,
    default: null
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['available', 'upcoming'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

const Merchandise = mongoose.model('Merchandise', merchandiseSchema)

export default Merchandise
