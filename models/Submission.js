import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  contentType: {
    type: String,
    enum: ['article', 'review', 'fan-content'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  publishedContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    default: null
  }
}, {
  timestamps: true
})

const Submission = mongoose.model('Submission', submissionSchema)

export default Submission
