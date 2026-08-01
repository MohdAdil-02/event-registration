const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

// All registration routes require login
router.post('/', protect, createRegistration);
router.get('/my', protect, getMyRegistrations);
router.get('/:id', protect, getRegistrationById);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
