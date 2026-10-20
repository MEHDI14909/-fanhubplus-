import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  favoriteFandoms: {
    type: [String],
    default: []
  },
  interests: {
    type: [String],
    default: []
  },
  displayPreference: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark'
  },
  fontSize: {
    type: String,
    enum: ['normal', 'large'],
    default: 'normal'
  },
  avatar: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: ''
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema)

export default User
