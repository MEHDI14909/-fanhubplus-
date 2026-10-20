import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendEmail } from '../utils/sendEmail.js'

const userData = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    favoriteFandoms: user.favoriteFandoms || [],
    interests: user.interests || [],
    displayPreference: user.displayPreference || 'dark',
    fontSize: user.fontSize || 'normal',
    avatar: user.avatar || '',
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  }
}

const registerUser = async (req, res) => {
  const { name, email, password } = req.body

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const oldUser = await User.findOne({ email: cleanEmail })

    if (oldUser) {
      return res.status(400).json({ message: 'Account already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'user'
    })

    return res.status(201).json({
      message: 'Registration successful',
      user: userData(user)
    })
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' })
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: cleanEmail })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const passwordMatched = await bcrypt.compare(password, user.password)

    if (!passwordMatched) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    user.lastLogin = new Date()
    await user.save()

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: userData(user)
    })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' })
  }
}

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(userData(user))
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load profile' })
  }
}

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const {
      name,
      email,
      favoriteFandoms,
      interests,
      displayPreference,
      fontSize,
      avatar
    } = req.body

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'Name is required' })
      }

      user.name = String(name).trim()
    }

    if (email !== undefined) {
      const cleanEmail = String(email).toLowerCase().trim()

      if (!cleanEmail) {
        return res.status(400).json({ message: 'Email is required' })
      }

      if (cleanEmail !== user.email) {
        const oldUser = await User.findOne({ email: cleanEmail })

        if (oldUser) {
          return res.status(400).json({ message: 'Email already in use' })
        }
      }

      user.email = cleanEmail
    }

    if (favoriteFandoms !== undefined) {
      if (!Array.isArray(favoriteFandoms)) {
        return res.status(400).json({ message: 'Favorite fandoms must be a list' })
      }

      user.favoriteFandoms = favoriteFandoms
    }

    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        return res.status(400).json({ message: 'Interests must be a list' })
      }

      user.interests = interests
    }

    if (displayPreference !== undefined) {
      if (displayPreference !== 'dark' && displayPreference !== 'light') {
        return res.status(400).json({ message: 'Invalid display preference' })
      }

      user.displayPreference = displayPreference
    }

    if (fontSize !== undefined) {
      if (fontSize !== 'normal' && fontSize !== 'large') {
        return res.status(400).json({ message: 'Invalid font size' })
      }

      user.fontSize = fontSize
    }

    if (avatar !== undefined) {
      user.avatar = String(avatar).trim()
    }

    await user.save()

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: userData(user)
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update profile' })
  }
}

const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: cleanEmail })

    if (!user) {
      return res.status(200).json({
        message: 'If the email is registered, a reset link will be created'
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    await user.save()

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`

    const mailSent = await sendEmail(
      user.email,
      'Fan Hub Plus Password Reset',
      `Reset your password: ${resetUrl}`
    )

    if (mailSent) {
      return res.status(200).json({ message: 'Password reset link sent to your email' })
    }

    return res.status(200).json({
      message: 'Password reset link created',
      resetUrl: resetUrl
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create reset link' })
  }
}

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body

  try {
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Both password fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    if (!req.params.token) {
      return res.status(400).json({ message: 'Invalid reset link' })
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' })
    }

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = ''
    user.resetPasswordExpire = null
    await user.save()

    return res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to reset password' })
  }
}

export {
  registerUser,
  loginUser,
  getMyProfile,
  updateMyProfile,
  forgotPassword,
  resetPassword
}
