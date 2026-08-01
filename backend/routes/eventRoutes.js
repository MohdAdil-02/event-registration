const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Public routes - anyone can browse events
router.get('/', getEvents);
router.get('/:id', getEventById);

// Organizer/Admin only routes
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.get('/:id/registrations', protect, authorize('organizer', 'admin'), getEventRegistrations);

module.exports = router;
