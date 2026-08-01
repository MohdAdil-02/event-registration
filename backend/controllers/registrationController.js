const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @route  POST /api/registrations
// @desc   Register the logged-in user for an event
// @access Private (any authenticated user)
exports.createRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { eventId, attendeeName, attendeeEmail, notes } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required' });
    }

    session.startTransaction();

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'cancelled' || event.status === 'completed') {
      await session.abortTransaction();
      return res.status(400).json({ message: `Cannot register for a ${event.status} event` });
    }

    // Prevent duplicate active registration
    const existing = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      status: 'confirmed',
    }).session(session);

    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'You are already registered for this event' });
    }

    if (event.seatsBooked >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'This event is fully booked' });
    }

    const [registration] = await Registration.create(
      [
        {
          user: req.user._id,
          event: eventId,
          attendeeName: attendeeName || req.user.name,
          attendeeEmail: attendeeEmail || req.user.email,
          notes,
        },
      ],
      { session }
    );

    event.seatsBooked += 1;
    await event.save({ session });

    await session.commitTransaction();

    return res.status(201).json({ message: 'Registration successful', registration });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: 'Error creating registration', error: error.message });
  } finally {
    session.endSession();
  }
};

// @route  GET /api/registrations/my
// @desc   View the logged-in user's own registrations
// @access Private
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event', 'title date location capacity seatsBooked status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: registrations.length, registrations });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching your registrations', error: error.message });
  }
};

// @route  GET /api/registrations/:id
// @desc   View a single registration
// @access Private (owner, or event organizer/admin)
exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    const isOwner = registration.user._id.toString() === req.user._id.toString();
    const isEventOrganizer = registration.event.organizer.toString() === req.user._id.toString();

    if (!isOwner && !isEventOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this registration' });
    }

    return res.status(200).json({ registration });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching registration', error: error.message });
  }
};

// @route  DELETE /api/registrations/:id
// @desc   Cancel a registration (frees up a seat)
// @access Private (owner, or event organizer/admin)
exports.cancelRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const registration = await Registration.findById(req.params.id).session(session);
    if (!registration) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Registration not found' });
    }

    const event = await Event.findById(registration.event).session(session);

    const isOwner = registration.user.toString() === req.user._id.toString();
    const isEventOrganizer = event && event.organizer.toString() === req.user._id.toString();

    if (!isOwner && !isEventOrganizer && req.user.role !== 'admin') {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized to cancel this registration' });
    }

    if (registration.status === 'cancelled') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    registration.status = 'cancelled';
    await registration.save({ session });

    if (event && event.seatsBooked > 0) {
      event.seatsBooked -= 1;
      await event.save({ session });
    }

    await session.commitTransaction();

    return res.status(200).json({ message: 'Registration cancelled successfully', registration });
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: 'Error cancelling registration', error: error.message });
  } finally {
    session.endSession();
  }
};
