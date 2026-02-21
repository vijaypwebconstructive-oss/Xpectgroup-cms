import express from 'express';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// GET /api/activity/recent - Get latest N activities
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities', message: error.message });
  }
});

// GET /api/activity - Get all activities (paginated, filterable)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = {};
    if (req.query.actorRole) query.actorRole = req.query.actorRole;
    if (req.query.actionType) query.actionType = req.query.actionType;
    if (req.query.entityType) query.entityType = req.query.entityType;
    if (req.query.entityId) query.entityId = req.query.entityId;

    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalActivities = await ActivityLog.countDocuments(query);

    res.json({
      activities,
      pagination: {
        total: totalActivities,
        page,
        pages: Math.ceil(totalActivities / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', message: error.message });
  }
});

// GET /api/activity/entity/:entityType/:entityId - Get activities for a specific entity
router.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const activities = await ActivityLog.find({ entityType, entityId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(activities);
  } catch (error) {
    console.error(`Error fetching activities for entity ${entityType}/${entityId}:`, error);
    res.status(500).json({ error: `Failed to fetch activities for ${entityType}/${entityId}`, message: error.message });
  }
});

export default router;
