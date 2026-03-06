import express from 'express';
import { sendTrainingExpiryReminder } from '../services/emailService.js';

const router = express.Router();

const isExpiringWithinDays = (expiryDateStr, days = 30) => {
  if (!expiryDateStr) return false;
  const expiry = new Date(expiryDateStr);
  if (isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};

/**
 * POST /api/training/send-expiry-reminder
 * Manually send expiry reminder to a cleaner
 */
router.post('/send-expiry-reminder', async (req, res) => {
  try {
    const { email, cleanerName, courseName, expiryDate } = req.body;

    if (!email || !cleanerName || !courseName || !expiryDate) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'email, cleanerName, courseName, and expiryDate are required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format'
      });
    }

    await sendTrainingExpiryReminder(email, cleanerName, courseName, expiryDate);

    res.status(200).json({
      success: true,
      message: 'Reminder sent successfully'
    });
  } catch (error) {
    console.error('Error sending training expiry reminder:', error);
    res.status(500).json({
      error: 'Failed to send reminder',
      message: error.message
    });
  }
});

/**
 * POST /api/training/check-and-send-expiry-reminders
 * Frontend sends records with resolved emails; backend filters by expiry and sends
 * Body: { recordsWithEmail: Array<{ id, name, course, expiryDate, email }> }
 */
router.post('/check-and-send-expiry-reminders', async (req, res) => {
  try {
    const { recordsWithEmail = [] } = req.body;

    if (!Array.isArray(recordsWithEmail)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'recordsWithEmail must be an array'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let sent = 0;

    for (const rec of recordsWithEmail) {
      const { id, name, course, expiryDate, email } = rec;
      if (!email || !emailRegex.test(email) || !name || !course || !expiryDate) continue;
      if (!isExpiringWithinDays(expiryDate, 30)) continue;

      try {
        await sendTrainingExpiryReminder(email, name, course, expiryDate);
        sent++;
      } catch (err) {
        console.error(`Failed to send reminder for record ${id}:`, err);
      }
    }

    res.status(200).json({
      success: true,
      sent
    });
  } catch (error) {
    console.error('Error in check-and-send-expiry-reminders:', error);
    res.status(500).json({
      error: 'Failed to process reminders',
      message: error.message
    });
  }
});

export default router;
