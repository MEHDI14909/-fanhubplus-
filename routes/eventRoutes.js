import express from 'express'
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent
} from '../controllers/eventController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllEvents)
router.get('/:id', getEventById)
router.post('/', protect, authorize('admin'), createEvent)
router.put('/:id', protect, authorize('admin'), updateEvent)
router.delete('/:id', protect, authorize('admin'), deleteEvent)

export default router
