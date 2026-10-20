import Bookmark from '../models/Bookmark.js'
import Feedback from '../models/Feedback.js'
import Submission from '../models/Submission.js'
import User from '../models/User.js'

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire').sort({ createdAt: -1 })
    return res.status(200).json(users)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load users' })
  }
}

const updateUserRole = async (req, res) => {
  const { role } = req.body

  try {
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Invalid user role' })
    }

    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ message: 'You cannot change your own role' })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.role = role
    await user.save()

    return res.status(200).json({
      message: 'User role updated',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        favoriteFandoms: user.favoriteFandoms,
        interests: user.interests,
        displayPreference: user.displayPreference,
        fontSize: user.fontSize,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    return res.status(404).json({ message: 'User not found' })
  }
}

const deleteUser = async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await Bookmark.deleteMany({ user: user._id })
    await Feedback.deleteMany({ user: user._id })
    await Submission.deleteMany({ user: user._id })
    await User.findByIdAndDelete(user._id)

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    return res.status(404).json({ message: 'User not found' })
  }
}

export { getAllUsers, updateUserRole, deleteUser }
