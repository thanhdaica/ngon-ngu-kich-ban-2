import axios from "axios";

// 🎯 URL bạn muốn test
const target = "http://localhost:3000/";

// 🎯 Số request mỗi đợt (để nhẹ nhàng)
const batchSize = 15;

// 🎯 Delay giữa các đợt (ms)
const slowDelay = 400;

// 💤 Hàm delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🚀 Hàm gửi 1 request
async function fire() {
  try {
    const res = await axios.get(target);
    console.log("✔ OK", res.status);
  } catch (e) {
    console.log("❌", e.response?.status || "ERROR");
  }
}

// 🔁 Vòng lặp slow mode
async function slowMode() {
  console.log("🚀 Slow-mode test đang chạy...");

  while (true) {
    console.log(`\n📌 Gửi ${batchSize} requests...`);

    // Gửi batch nhỏ
    await Promise.all(Array.from({ length: batchSize }, fire));

    console.log(`⏳ Nghỉ ${slowDelay}ms rồi chạy tiếp...\n`);
    await sleep(slowDelay);
  }
}

slowMode();