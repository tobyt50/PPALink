import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import agencyRoutes from './modules/agencies/agency.routes';
import authRoutes from './modules/auth/auth.routes';
import candidateRoutes from './modules/candidates/candidate.routes';
import utilRoutes from './modules/utils/utils.routes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ppahire backend running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/utils', utilRoutes);

// Error handler
app.use(errorHandler);

export default app;