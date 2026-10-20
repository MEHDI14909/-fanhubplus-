import express from 'express'
import {
  addBookmark,
  getMyBookmarks,
  removeBookmark
} from '../controllers/bookmarkController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getMyBookmarks)
router.post('/', protect, addBookmark)
router.delete('/:id', protect, removeBookmark)

export default router
