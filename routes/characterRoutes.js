import express from 'express'
import {
  createCharacter,
  deleteCharacter,
  getCharacterById,
  getCharacters,
  updateCharacter
} from '../controllers/characterController.js'
import { authorize, protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getCharacters)
router.get('/:id', getCharacterById)
router.post('/', protect, authorize('admin'), createCharacter)
router.put('/:id', protect, authorize('admin'), updateCharacter)
router.delete('/:id', protect, authorize('admin'), deleteCharacter)

export default router
