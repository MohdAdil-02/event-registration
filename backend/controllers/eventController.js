const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @route  GET /api/events
// @desc   List all events (with optional search/filter/pagination)
// @access Public
exports.getEvents = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email')
        .sort({ date: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    return res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      events,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

// @route  GET /api/events/:id
// @desc   Get single event details
// @access Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.status(200).json({ event });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

// @route  POST /api/events
// @desc   Create a new event
// @access Private (organizer, admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, date, location, capacity } = req.body;

    if (!title || !description || !date || !location || !capacity) {
      return res.status(400).json({
        message: 'title, description, date, location and capacity are required',
      });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      location,
      capacity,
      organizer: req.user._id,
    });

    return res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// @route  PUT /api/events/:id
// @desc   Update an event
// @access Private (organizer who owns it, or admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const allowedFields = ['title', 'description', 'category', 'date', 'location', 'capacity', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    // Prevent capacity being set below seats already booked
    if (event.capacity < event.seatsBooked) {
      return res.status(400).json({ message: 'Capacity cannot be less than seats already booked' });
    }

    await event.save();
    return res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

// @route  DELETE /api/events/:id
// @desc   Delete an event
// @access Private (organizer who owns it, or admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    return res.status(200).json({ message: 'Event and its registrations deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

// @route  GET /api/events/:id/registrations
// @desc   View all registrations for one event (organizer/admin - for their event management panel)
// @access Private (organizer who owns it, or admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these registrations' });
    }

    const registrations = await Registration.find({ event: event._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ event: event.title, count: registrations.length, registrations });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
};
