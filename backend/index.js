import express from 'express';
import 'dotenv/config';
import router from './routes/index.js';
import connectMDB from './connect.js';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from 'url'; // Import thêm cái này

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình chính xác cho __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors()); // Cho phép CORS cơ bản

// Routes API
router(app);

// Cấu hình phục vụ Frontend (Deploy Monorepo)
// Vì file index.js nằm trong folder /backend, nên cần lùi ra 1 cấp (../) để vào frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const uri = process.env.MONGO_URI || null;
connectMDB(uri).then(() => {
    app.listen(PORT, () => {
      console.log(`Server bắt đầu trên cổng ${PORT}`);
    });
});