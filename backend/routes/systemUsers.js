import express from 'express';
import SystemUser from '../models/SystemUser.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const docs = await SystemUser.find().sort({ createdAt: -1 }).lean();
    const list = docs.map(d => ({
      id: d.id,
      fullName: d.fullName,
      email: d.email,
      phone: d.phone || '',
      role: d.role,
      status: d.status || 'active',
      lastLogin: d.lastLogin || '',
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '',
    }));
    res.json(list);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await SystemUser.findOne({ id: req.params.id }).lean();
    if (!doc) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: doc.id,
      fullName: doc.fullName,
      email: doc.email,
      phone: doc.phone || '',
      role: doc.role,
      status: doc.status || 'active',
      lastLogin: doc.lastLogin || '',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '',
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user', message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.fullName || !body.email || !body.role) {
      return res.status(400).json({ error: 'fullName, email, role are required' });
    }
    const doc = await SystemUser.create({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone || '',
      role: body.role,
      status: body.status || 'active',
      lastLogin: body.lastLogin || '',
    });
    res.status(201).json({
      id: doc.id,
      fullName: doc.fullName,
      email: doc.email,
      phone: doc.phone || '',
      role: doc.role,
      status: doc.status,
      lastLogin: doc.lastLogin || '',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '',
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user', message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const doc = await SystemUser.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: 'User not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user', message: err.message });
  }
});

export default router;
