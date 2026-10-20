import express from 'express'
import {
  createContent,
  deleteContent,
  getAllContent,
  getContentById,
  rateContent,
  updateContent
} from '../controllers/contentController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllContent)
router.get('/:id', getContentById)
router.post('/:id/rate', protect, rateContent)
router.post('/', protect, authorize('admin'), createContent)
router.put('/:id', protect, authorize('admin'), updateContent)
router.delete('/:id', protect, authorize('admin'), deleteContent)

export default router
