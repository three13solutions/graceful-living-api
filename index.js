import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import applicationRoutes from "./routes/application.js";
import applicationRoutes from './routes/application.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api', applicationRoutes);
app.use(cors());
app.use(bodyParser.json());
app.use("/api/applications", applicationRoutes);

app.get("/", (req, res) => {
  res.send("Graceful Living API is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
