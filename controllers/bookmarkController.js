import Bookmark from '../models/Bookmark.js'
import Character from '../models/Character.js'
import Content from '../models/Content.js'
import Merchandise from '../models/Merchandise.js'

const getBookmarkItem = async (itemType, itemId) => {
  if (itemType === 'article' || itemType === 'video') {
    return Content.findById(itemId).populate('category', 'name')
  }

  if (itemType === 'character') {
    return Character.findById(itemId).populate('category', 'name')
  }

  if (itemType === 'merchandise') {
    return Merchandise.findById(itemId)
  }

  return null
}

const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ createdAt: -1 })
    const result = []

    for (const bookmark of bookmarks) {
      const item = await getBookmarkItem(bookmark.itemType, bookmark.itemId)
      const data = bookmark.toObject()
      data.item = item
      result.push(data)
    }

    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load bookmarks' })
  }
}

const addBookmark = async (req, res) => {
  const { itemType, itemId, note } = req.body

  try {
    if (!itemType || !itemId) {
      return res.status(400).json({ message: 'Item type and item ID are required' })
    }

    const allowedTypes = ['article', 'video', 'character', 'merchandise']

    if (!allowedTypes.includes(itemType)) {
      return res.status(400).json({ message: 'This item type cannot be bookmarked' })
    }

    const item = await getBookmarkItem(itemType, itemId)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    const oldBookmark = await Bookmark.findOne({
      user: req.user._id,
      itemType: itemType,
      itemId: itemId
    })

    if (oldBookmark) {
      return res.status(400).json({ message: 'Item already bookmarked' })
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      itemType: itemType,
      itemId: itemId,
      note: note || ''
    })

    const data = bookmark.toObject()
    data.item = item

    return res.status(201).json({
      message: 'Bookmark added successfully',
      bookmark: data
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to add bookmark' })
  }
}

const removeBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    })

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' })
    }

    return res.status(200).json({ message: 'Bookmark removed successfully' })
  } catch (error) {
    return res.status(404).json({ message: 'Bookmark not found' })
  }
}

export { getMyBookmarks, addBookmark, removeBookmark }
