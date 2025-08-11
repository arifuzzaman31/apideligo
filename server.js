// server.js
import express from 'express';
import { Pool } from 'pg';
import userRoutes from './routes/frontRoute/userRoute.js';
import userInfoRoutes from './routes/frontRoute/userInfoRoute.js';
import userLocationRoutes from './routes/frontRoute/userLocationRoute.js';
import utilityRoute from './routes/frontRoute/utilityRoute.js';
import othersRoute from './routes/backRoute/othersRoute.js';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 5000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routes
app.use('/api/users', userRoutes);
app.use('/api/user-info', userInfoRoutes);
app.use('/api/user-location', userLocationRoutes);
app.use('/api/', utilityRoute);
app.use('/api/backend',othersRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
