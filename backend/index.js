import express from 'express';
import 'dotenv/config'; // Cách 1: Import và tự động chạy config
import router from './routes/index.js';
import connectMDB from './connect.js';
import cors from 'cors';
import path from "path";
const app = express();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
//middleware
app.use(express.json());
if(process.env.NODE_ENV === 'production'){
  app.use(cors({ origin: "http://localhost:5173" }));
}



// Routes
// Lưu ý: Bạn đang import 'router' từ './routes/index.js' và gọi nó như một function.
// Đảm bảo file './routes/index.js' của bạn được thiết kế để nhận 'app' làm đối số.
router(app);
if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname,"../frontend/dist")));

  app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
  });
}

//kết nối với database
const uri = process.env.MONGO_URI || null;
connectMDB(uri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server bắt đầu trên cổng ${PORT}`);
    });
  });