import express from 'express';
import applicationRoutes from './routes/application.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://glf-five.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// 👉 Add this line to handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());
app.use('/api', applicationRoutes);

app.get('/', (req, res) => {
  res.send('Graceful Living API is live');
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
