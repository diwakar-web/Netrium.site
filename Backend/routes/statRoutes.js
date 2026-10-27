import express from 'express';
import SiteStat from '../models/SiteStat.js';

const router = express.Router();

const STAT_KEY = 'laboratory_users_count';
const BASE_COUNT = 850;

/**
 * POST /api/stats/visit
 * Called on every site loading to increment laboratory user count starting from 850
 */
router.post('/visit', async (req, res) => {
  try {
    let stat = await SiteStat.findOne({ key: STAT_KEY });

    if (!stat) {
      // First visit: initialize at 850 and increment to 851
      stat = await SiteStat.create({
        key: STAT_KEY,
        value: BASE_COUNT + 1
      });
      console.log(`[SiteStat] Initialized ${STAT_KEY} counter at ${stat.value}`);
    } else {
      stat.value += 1;
      await stat.save();
      console.log(`[SiteStat] Incremented ${STAT_KEY} to ${stat.value}`);
    }

    return res.status(200).json({
      success: true,
      count: stat.value
    });
  } catch (error) {
    console.error('[SiteStat Visit Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record site visit count',
      count: BASE_COUNT
    });
  }
});

/**
 * GET /api/stats/laboratory-users
 * Fetch current laboratory user count without incrementing
 */
router.get('/laboratory-users', async (req, res) => {
  try {
    let stat = await SiteStat.findOne({ key: STAT_KEY });
    if (!stat) {
      stat = await SiteStat.create({
        key: STAT_KEY,
        value: BASE_COUNT
      });
    }

    return res.status(200).json({
      success: true,
      count: stat.value
    });
  } catch (error) {
    console.error('[SiteStat Get Error]', error);
    return res.status(500).json({
      success: false,
      count: BASE_COUNT
    });
  }
});

export default router;
