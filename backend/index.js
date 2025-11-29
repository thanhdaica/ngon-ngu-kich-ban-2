import express from 'express';
import 'dotenv/config';
import router from './routes/index.js';
import connectMDB from './connect.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Giúp Render / proxy lấy đúng IP thật
app.set("trust proxy", 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

/* ============================================================
   1) 🛡 GLOBAL DDoS PROTECTION (10 giây reset 1 lần)
   ============================================================ */
const globalLimiter = rateLimit({
  windowMs: 10 * 1000,      // 10 GIÂY (test nhanh)
  max: 100,                 // mỗi IP được gửi 100 request / 10s
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "⚠️ Bạn gửi quá nhanh, vui lòng đợi 10 giây để thử lại."
  }
});

app.use(globalLimiter);


/* ============================================================
   2) 🛡 CHỐNG BRUTE-FORCE LOGIN (cũng reset 10 giây)
   ============================================================ */
const loginLimiter = rateLimit({
  windowMs: 10 * 1000,  // 10 GIÂY
  max: 10,              // chỉ 10 request / 10s cho login
  message: {
    success: false,
    message: "⚠️ Đăng nhập quá nhanh. Thử lại sau 10 giây."
  }
});

// Áp dụng cho đúng route /api/auth/login
app.use("/api/auth/login", loginLimiter);


/* ============================================================
   3) ROUTES API
   ============================================================ */
router(app);


/* ============================================================
   4) SERVE FRONTEND
   ============================================================ */
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});


/* ============================================================
   5) KẾT NỐI MONGO + START SERVER
   ============================================================ */
const uri = process.env.MONGO_URI || null;

connectMDB(uri).then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại cổng ${PORT}`);
    console.log("🛡️ Anti-DDoS 10 giây & Brute Force 10 giây đã bật (chế độ TEST).");
  });
});