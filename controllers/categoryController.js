import Category from '../models/Category.js'
import Character from '../models/Character.js'
import Content from '../models/Content.js'

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    return res.status(200).json(categories)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load categories' })
  }
}

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    return res.status(200).json(category)
  } catch (error) {
    return res.status(404).json({ message: 'Category not found' })
  }
}

const createCategory = async (req, res) => {
  const { name, description, image, status } = req.body

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    const oldCategory = await Category.findOne({ name: name.trim() })

    if (oldCategory) {
      return res.status(400).json({ message: 'Category already exists' })
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      image: image || '',
      status: status || 'active'
    })

    return res.status(201).json({
      message: 'Category created successfully',
      category: category
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create category' })
  }
}

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim()

      if (!name) {
        return res.status(400).json({ message: 'Category name is required' })
      }

      const oldCategory = await Category.findOne({
        name: name,
        _id: { $ne: category._id }
      })

      if (oldCategory) {
        return res.status(400).json({ message: 'Category already exists' })
      }

      category.name = name
    }

    if (req.body.description !== undefined) {
      category.description = req.body.description
    }

    if (req.body.image !== undefined) {
      category.image = req.body.image
    }

    if (req.body.status !== undefined) {
      category.status = req.body.status
    }

    await category.save()

    return res.status(200).json({
      message: 'Category updated successfully',
      category: category
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update category' })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    const contentCount = await Content.countDocuments({ category: category._id })
    const characterCount = await Character.countDocuments({ category: category._id })

    if (contentCount > 0 || characterCount > 0) {
      return res.status(400).json({ message: 'Category is being used by existing records' })
    }

    await Category.findByIdAndDelete(category._id)

    return res.status(200).json({ message: 'Category deleted successfully' })
  } catch (error) {
    return res.status(404).json({ message: 'Category not found' })
  }
}

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}
