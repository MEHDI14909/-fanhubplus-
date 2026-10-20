import Feedback from '../models/Feedback.js'

const createFeedback = async (req, res) => {
  const { type, message } = req.body

  try {
    if (!type || !message || !message.trim()) {
      return res.status(400).json({ message: 'Type and message are required' })
    }

    const allowedTypes = ['bug', 'suggestion', 'query']

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid feedback type' })
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      type: type,
      message: message.trim()
    })

    const savedFeedback = await Feedback.findById(feedback._id).populate('user', 'name email role')

    return res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: savedFeedback
    })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit feedback' })
  }
}

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })

    return res.status(200).json(feedback)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load feedback' })
  }
}

const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body
    const allowedStatuses = ['new', 'reviewed', 'resolved']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid feedback status' })
    }

    const feedback = await Feedback.findById(req.params.id)

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' })
    }

    feedback.status = status
    await feedback.save()

    const savedFeedback = await Feedback.findById(feedback._id).populate('user', 'name email role')

    return res.status(200).json({
      message: 'Feedback status updated',
      feedback: savedFeedback
    })
  } catch (error) {
    return res.status(404).json({ message: 'Feedback not found' })
  }
}

export { createFeedback, getAllFeedback, updateFeedbackStatus }
