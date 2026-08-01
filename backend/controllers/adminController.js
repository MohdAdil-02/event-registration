const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @route  GET /api/admin/users
// @desc   List all users
// @access Private (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// @route  PUT /api/admin/users/:id/role
// @desc   Promote/demote a user (e.g. make someone an 'organizer' or 'admin')
// @access Private (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be one of: user, organizer, admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// @route  DELETE /api/admin/users/:id
// @desc   Remove a user account
// @access Private (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteOne();
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// @route  GET /api/admin/stats
// @desc   Dashboard summary for the admin panel
// @access Private (admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalOrganizers, totalEvents, totalRegistrations, upcomingEvents] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'organizer' }),
        Event.countDocuments(),
        Registration.countDocuments({ status: 'confirmed' }),
        Event.countDocuments({ status: 'upcoming' }),
      ]);

    return res.status(200).json({
      totalUsers,
      totalOrganizers,
      totalEvents,
      totalRegistrations,
      upcomingEvents,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
