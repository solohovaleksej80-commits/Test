import { Router } from 'express';
import authRoutes from './authRoutes';
import gameRoutes from './gameRoutes';
import shopRoutes from './shopRoutes';
import questRoutes from './questRoutes';
import referralRoutes from './referralRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/shop', shopRoutes);
router.use('/quests', questRoutes);
router.use('/referral', referralRoutes);

// Здоровье API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;
