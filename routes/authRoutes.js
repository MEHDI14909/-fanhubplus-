import express from 'express'
import {
  forgotPassword,
  getMyProfile,
  loginUser,
  registerUser,
  resetPassword,
  updateMyProfile
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.get('/profile', protect, getMyProfile)
router.put('/profile', protect, updateMyProfile)

export default router
