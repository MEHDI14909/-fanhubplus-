import mongoose from 'mongoose'

const contentSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'audio', 'image'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    default: ''
  },
  releaseYear: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: ''
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  popularityScore: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  ratingTotal: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
})

const Content = mongoose.model('Content', contentSchema)

export default Content
