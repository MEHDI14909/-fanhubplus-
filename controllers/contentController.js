import Bookmark from '../models/Bookmark.js'
import Category from '../models/Category.js'
import Content from '../models/Content.js'

const getAllContent = async (req, res) => {
  try {
    const filter = {}
    const { search, category, genre, releaseYear, type, sort } = req.query

    if (category) {
      filter.category = category
    }

    if (genre) {
      filter.genre = { $regex: genre, $options: 'i' }
    }

    if (releaseYear) {
      filter.releaseYear = Number(releaseYear)
    }

    if (type) {
      filter.type = type
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    let sortBy = { createdAt: -1 }

    if (sort === 'popular') {
      sortBy = { popularityScore: -1, views: -1 }
    }

    if (sort === 'alphabetical') {
      sortBy = { title: 1 }
    }

    const content = await Content.find(filter)
      .populate('category', 'name')
      .sort(sortBy)

    return res.status(200).json(content)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load content' })
  }
}

const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id).populate('category', 'name')

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    content.views = content.views + 1
    await content.save()

    return res.status(200).json(content)
  } catch (error) {
    return res.status(404).json({ message: 'Content not found' })
  }
}

const createContent = async (req, res) => {
  const {
    category,
    title,
    type,
    description,
    genre,
    releaseYear,
    image,
    mediaUrl,
    tags,
    popularityScore,
    status
  } = req.body

  try {
    if (!category || !title || !type || !description) {
      return res.status(400).json({
        message: 'Category, title, type and description are required'
      })
    }

    const categoryFound = await Category.findById(category)

    if (!categoryFound) {
      return res.status(404).json({ message: 'Category not found' })
    }

    const content = await Content.create({
      category: category,
      title: title.trim(),
      type: type,
      description: description.trim(),
      genre: genre || '',
      releaseYear: releaseYear ? Number(releaseYear) : null,
      image: image || '',
      mediaUrl: mediaUrl || '',
      tags: Array.isArray(tags) ? tags : [],
      popularityScore: Number(popularityScore) || 0,
      status: status || 'active'
    })

    const savedContent = await Content.findById(content._id).populate('category', 'name')

    return res.status(201).json({
      message: 'Content created successfully',
      content: savedContent
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create content' })
  }
}

const updateContent = async (req, res) => {
  try {
    if (req.body.category) {
      const category = await Category.findById(req.body.category)

      if (!category) {
        return res.status(404).json({ message: 'Category not found' })
      }
    }

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name')

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    return res.status(200).json({
      message: 'Content updated successfully',
      content: content
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update content' })
  }
}

const deleteContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id)

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    await Bookmark.deleteMany({ itemId: content._id })

    return res.status(200).json({ message: 'Content deleted successfully' })
  } catch (error) {
    return res.status(404).json({ message: 'Content not found' })
  }
}

const rateContent = async (req, res) => {
  try {
    const rating = Number(req.body.rating)

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    const content = await Content.findById(req.params.id)

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    content.ratingTotal = content.ratingTotal + rating
    content.ratingCount = content.ratingCount + 1
    await content.save()

    const averageRating = content.ratingTotal / content.ratingCount

    return res.status(200).json({
      message: 'Rating saved',
      averageRating: Number(averageRating.toFixed(1)),
      ratingCount: content.ratingCount
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to save rating' })
  }
}

export {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  rateContent
}
