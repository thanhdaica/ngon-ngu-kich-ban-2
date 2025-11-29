// backend/utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Dùng host trực tiếp của Gmail
            port: 587,              // Cổng chuẩn cho TLS
            secure: false,          // false cho port 587
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
            // --- QUAN TRỌNG: FIX LỖI TIMEOUT TRÊN RENDER ---
            family: 4, // Ép buộc chỉ dùng IPv4 (Fix lỗi ETIMEDOUT)
            // Tăng thời gian chờ lên
            connectionTimeout: 10000, 
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });

        console.log(`⏳ Đang kết nối Gmail (IPv4) để gửi tới: ${email}...`);

        // Kiểm tra kết nối trước khi gửi (Optional nhưng tốt để debug)
        await transporter.verify();
        console.log("✅ Kết nối SMTP thành công!");

        const info = await transporter.sendMail({
            from: `"Shop Sách 3 Anh Em" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        });

        console.log(`✅ Email đã gửi thành công! ID: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error("❌ Lỗi gửi mail chi tiết:");
        console.error(error);
        return false;
    }
};

export default sendEmail;