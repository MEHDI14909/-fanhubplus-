import Category from '../models/Category.js'
import Content from '../models/Content.js'
import Submission from '../models/Submission.js'

const createSubmission = async (req, res) => {
  const { title, contentType, category, content, image } = req.body

  try {
    if (!title || !contentType || !category || !content) {
      return res.status(400).json({
        message: 'Title, content type, category and content are required'
      })
    }

    const submission = await Submission.create({
      user: req.user._id,
      title: title.trim(),
      contentType: contentType,
      category: category.trim(),
      content: content.trim(),
      image: image || ''
    })

    return res.status(201).json({
      message: 'Submission created successfully',
      submission: submission
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create submission' })
  }
}

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json(submissions)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load submissions' })
  }
}

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })

    return res.status(200).json(submissions)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load submissions' })
  }
}

const updateSubmissionStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body
    const allowedStatuses = ['pending', 'approved', 'rejected']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid submission status' })
    }

    const submission = await Submission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    if (status === 'approved' && !submission.publishedContent) {
      const category = await Category.findOne({
        name: { $regex: `^${submission.category}$`, $options: 'i' }
      })

      if (!category) {
        return res.status(400).json({ message: 'Submission category not found' })
      }

      const content = await Content.create({
        category: category._id,
        title: submission.title,
        type: 'article',
        description: submission.content,
        image: submission.image || '',
        tags: ['fan-submission'],
        status: 'active'
      })

      submission.publishedContent = content._id
    }

    if (status === 'rejected' && submission.publishedContent) {
      await Content.findByIdAndDelete(submission.publishedContent)
      submission.publishedContent = null
    }

    submission.status = status
    submission.adminNote = adminNote || ''
    await submission.save()

    const savedSubmission = await Submission.findById(submission._id).populate('user', 'name email role')

    return res.status(200).json({
      message: 'Submission status updated',
      submission: savedSubmission
    })
  } catch (error) {
    return res.status(404).json({ message: 'Submission not found' })
  }
}

export {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  updateSubmissionStatus
}
