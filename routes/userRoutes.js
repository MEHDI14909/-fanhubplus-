import express from 'express'
import {
  deleteUser,
  getAllUsers,
  updateUserRole
} from '../controllers/userController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, authorize('admin'), getAllUsers)
router.put('/:id/role', protect, authorize('admin'), updateUserRole)
router.delete('/:id', protect, authorize('admin'), deleteUser)

export default router
