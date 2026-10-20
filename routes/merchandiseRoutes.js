import express from 'express'
import {
  createMerchandise,
  deleteMerchandise,
  getAllMerchandise,
  getMerchandiseById,
  updateMerchandise
} from '../controllers/merchandiseController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllMerchandise)
router.get('/:id', getMerchandiseById)
router.post('/', protect, authorize('admin'), createMerchandise)
router.put('/:id', protect, authorize('admin'), updateMerchandise)
router.delete('/:id', protect, authorize('admin'), deleteMerchandise)

export default router
