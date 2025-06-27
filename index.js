import express from 'express';
import applicationRoutes from './routes/application.js'; // ✅ Import only once
import cors from 'cors';



const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://glf-five.vercel.app', // your frontend
  methods: ['GET', 'POST', 'OPTIONS'],   // must include OPTIONS
  allowedHeaders: ['Content-Type'],      // important for FormData
}));

app.use(express.json());
app.use('/api', applicationRoutes);

app.get('/', (req, res) => {
  res.send('Graceful Living API is live');
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
