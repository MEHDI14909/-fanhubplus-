import Bookmark from '../models/Bookmark.js'
import Merchandise from '../models/Merchandise.js'

const getAllMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.find().sort({ createdAt: -1 })
    return res.status(200).json(merchandise)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load merchandise' })
  }
}

const getMerchandiseById = async (req, res) => {
  try {
    const merchandise = await Merchandise.findById(req.params.id)

    if (!merchandise) {
      return res.status(404).json({ message: 'Merchandise not found' })
    }

    merchandise.views = merchandise.views + 1
    await merchandise.save()

    return res.status(200).json(merchandise)
  } catch (error) {
    return res.status(404).json({ message: 'Merchandise not found' })
  }
}

const createMerchandise = async (req, res) => {
  const {
    name,
    description,
    price,
    image,
    category,
    fandom,
    releaseDate,
    tags,
    status
  } = req.body

  try {
    if (!name || !description || price === undefined || !category || !fandom) {
      return res.status(400).json({
        message: 'Name, description, price, category and fandom are required'
      })
    }

    const merchandise = await Merchandise.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image || '',
      category: category.trim(),
      fandom: fandom.trim(),
      releaseDate: releaseDate || null,
      tags: Array.isArray(tags) ? tags : [],
      status: status || 'available'
    })

    return res.status(201).json({
      message: 'Merchandise created successfully',
      merchandise: merchandise
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create merchandise' })
  }
}

const updateMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    if (!merchandise) {
      return res.status(404).json({ message: 'Merchandise not found' })
    }

    return res.status(200).json({
      message: 'Merchandise updated successfully',
      merchandise: merchandise
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update merchandise' })
  }
}

const deleteMerchandise = async (req, res) => {
  try {
    const merchandise = await Merchandise.findByIdAndDelete(req.params.id)

    if (!merchandise) {
      return res.status(404).json({ message: 'Merchandise not found' })
    }

    await Bookmark.deleteMany({ itemType: 'merchandise', itemId: merchandise._id })

    return res.status(200).json({ message: 'Merchandise deleted successfully' })
  } catch (error) {
    return res.status(404).json({ message: 'Merchandise not found' })
  }
}

export {
  getAllMerchandise,
  getMerchandiseById,
  createMerchandise,
  updateMerchandise,
  deleteMerchandise
}
