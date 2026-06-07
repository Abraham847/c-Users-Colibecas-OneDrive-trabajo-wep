import { Router } from 'express';
import authRoutes from './auth';
import domainRoutes from './domains';
import hostingRoutes from './hosting';
import dnsRoutes from './dns';
import emailRoutes from './email';
import fileRoutes from './files';
import aiRoutes from './ai';
import sslRoutes from './ssl';
import adminRoutes from './admin';
import supportRoutes from './support';

const router = Router();

router.use('/auth', authRoutes);
router.use('/domains', domainRoutes);
router.use('/hosting', hostingRoutes);
router.use('/dns', dnsRoutes);
router.use('/emails', emailRoutes);
router.use('/files', fileRoutes);
router.use('/ai', aiRoutes);
router.use('/ssl', sslRoutes);
router.use('/admin', adminRoutes);
router.use('/support', supportRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'CloudHost API running', timestamp: new Date().toISOString() });
});

export default router;
