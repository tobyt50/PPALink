import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import adminRoutes from './modules/admin/admin.routes';
import agencyRoutes from './modules/agencies/agency.routes';
import applicationRoutes from './modules/applications/application.routes';
import authRoutes from './modules/auth/auth.routes';
import candidateRoutes from './modules/candidates/candidate.routes';
import messageRoutes from './modules/messaging/message.routes';
import publicRoutes from './modules/public/public.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import utilRoutes from './modules/utils/utils.routes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ppalink backend running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/utils', utilRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/messages', messageRoutes);

// Error handler
app.use(errorHandler);

export default app;