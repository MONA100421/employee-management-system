import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import hrRoutes from './routes/hr';
import employeeRoutes from './routes/employee';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employee', employeeRoutes);

export default app;
