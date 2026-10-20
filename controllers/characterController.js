import Bookmark from '../models/Bookmark.js'
import Category from '../models/Category.js'
import Character from '../models/Character.js'

const getCharacters = async (req, res) => {
  try {
    const filter = {}
    const { search, category, fandom } = req.query

    if (category) {
      filter.category = category
    }

    if (fandom) {
      filter.fandom = { $regex: fandom, $options: 'i' }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fandom: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    const characters = await Character.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    return res.status(200).json(characters)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load characters' })
  }
}

const getCharacterById = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id).populate('category', 'name')

    if (!character) {
      return res.status(404).json({ message: 'Character not found' })
    }

    return res.status(200).json(character)
  } catch (error) {
    return res.status(404).json({ message: 'Character not found' })
  }
}

const createCharacter = async (req, res) => {
  const { category, name, fandom, bio, image, tags, status } = req.body

  try {
    if (!category || !name || !fandom || !bio) {
      return res.status(400).json({
        message: 'Category, name, fandom and bio are required'
      })
    }

    const categoryFound = await Category.findById(category)

    if (!categoryFound) {
      return res.status(404).json({ message: 'Category not found' })
    }

    const character = await Character.create({
      category: category,
      name: name.trim(),
      fandom: fandom.trim(),
      bio: bio.trim(),
      image: image || '',
      tags: Array.isArray(tags) ? tags : [],
      status: status || 'active'
    })

    const savedCharacter = await Character.findById(character._id).populate('category', 'name')

    return res.status(201).json({
      message: 'Character created successfully',
      character: savedCharacter
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create character' })
  }
}

const updateCharacter = async (req, res) => {
  try {
    if (req.body.category) {
      const category = await Category.findById(req.body.category)

      if (!category) {
        return res.status(404).json({ message: 'Category not found' })
      }
    }

    const character = await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name')

    if (!character) {
      return res.status(404).json({ message: 'Character not found' })
    }

    return res.status(200).json({
      message: 'Character updated successfully',
      character: character
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update character' })
  }
}

const deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id)

    if (!character) {
      return res.status(404).json({ message: 'Character not found' })
    }

    await Bookmark.deleteMany({ itemType: 'character', itemId: character._id })

    return res.status(200).json({ message: 'Character deleted successfully' })
  } catch (error) {
    return res.status(404).json({ message: 'Character not found' })
  }
}

export {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter
}
