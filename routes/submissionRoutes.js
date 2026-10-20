import express from 'express'
import {
  createSubmission,
  getAllSubmissions,
  getMySubmissions,
  updateSubmissionStatus
} from '../controllers/submissionController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createSubmission)
router.get('/my', protect, getMySubmissions)
router.get('/', protect, authorize('admin'), getAllSubmissions)
router.put('/:id/status', protect, authorize('admin'), updateSubmissionStatus)

export default router
