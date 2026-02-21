import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// GET /api/admin/profile - Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const admin = await Admin.getAdmin(); // Ensures admin document exists
    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile', message: error.message });
  }
});

// PUT /api/admin/profile - Update admin profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, bio, role, profilePicture } = req.body;
    const admin = await Admin.findOneAndUpdate(
      { id: 'admin-001' },
      { name, email, bio, role, profilePicture },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(admin);
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ error: 'Failed to update admin profile', message: error.message });
  }
});

// PATCH /api/admin/profile/picture - Update profile picture only
router.patch('/profile/picture', async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const admin = await Admin.findOneAndUpdate(
      { id: 'admin-001' },
      { profilePicture },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(admin);
  } catch (error) {
    console.error('Error updating admin profile picture:', error);
    res.status(500).json({ error: 'Failed to update admin profile picture', message: error.message });
  }
});

// PATCH /api/admin/profile/bio - Update bio only
router.patch('/profile/bio', async (req, res) => {
  try {
    const { bio } = req.body;
    const admin = await Admin.findOneAndUpdate(
      { id: 'admin-001' },
      { bio },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(admin);
  } catch (error) {
    console.error('Error updating admin bio:', error);
    res.status(500).json({ error: 'Failed to update admin bio', message: error.message });
  }
});

export default router;
