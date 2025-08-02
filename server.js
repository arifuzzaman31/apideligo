// server.js
import express from 'express';
import { Pool } from 'pg';
import userRoutes from './routes/userRoute.js';
import userInfoRoutes from './routes/userInfoRoute.js';
import userLocationRoutes from './routes/userLocationRoute.js';

const app = express();
const port = process.env.PORT || 5000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/user-info', userInfoRoutes);
app.use('/api/user-location', userLocationRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
