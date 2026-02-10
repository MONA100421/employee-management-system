import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import hrRoutes from './routes/hr';
import employeeRoutes from './routes/employee';
import onboardingRoutes from './routes/onboarding';
import documentRoutes from './routes/document'; 
import notificationRouter from './routes/notification';


const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api', onboardingRoutes);
app.use('/api/documents', documentRoutes);
app.use("/notifications", notificationRouter);

export default app;
