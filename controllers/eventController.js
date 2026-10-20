import Event from '../models/Event.js'

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: 1 })
    return res.status(200).json(events)
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load events' })
  }
}

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    return res.status(200).json(event)
  } catch (error) {
    return res.status(404).json({ message: 'Event not found' })
  }
}

const createEvent = async (req, res) => {
  const {
    title,
    description,
    category,
    startDate,
    endDate,
    venue,
    city,
    image,
    ticketLink,
    locationLink,
    status
  } = req.body

  try {
    if (!title || !description || !category || !startDate || !endDate || !venue || !city) {
      return res.status(400).json({ message: 'Required event fields are missing' })
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      startDate: startDate,
      endDate: endDate,
      venue: venue.trim(),
      city: city.trim(),
      image: image || '',
      ticketLink: ticketLink || '',
      locationLink: locationLink || '',
      status: status || 'upcoming'
    })

    return res.status(201).json({
      message: 'Event created successfully',
      event: event
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create event' })
  }
}

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    return res.status(200).json({
      message: 'Event updated successfully',
      event: event
    })
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update event' })
  }
}

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    return res.status(200).json({ message: 'Event deleted successfully' })
  } catch (error) {
    return res.status(404).json({ message: 'Event not found' })
  }
}

export {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
}
