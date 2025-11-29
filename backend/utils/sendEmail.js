// backend/utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            // 1. Dùng host cụ thể thay vì service: 'gmail'
            host: "smtp.gmail.com", 
            port: 587, 
            secure: false, // false cho port 587 (STARTTLS)
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
            // 2. QUAN TRỌNG: Ép buộc dùng IPv4 để tránh lỗi Timeout trên Render
            family: 4, 
            // 3. Tăng thời gian chờ lên
            connectionTimeout: 10000, 
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });

        console.log(`⏳ Đang kết nối Gmail (IPv4) để gửi tới: ${email}...`);

        // Kiểm tra kết nối trước
        await transporter.verify();
        console.log("✅ Kết nối SMTP thành công! Đang gửi...");

        const info = await transporter.sendMail({
            from: `"Shop Sách 3 Anh Em" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        });

        console.log(`✅ Email đã gửi thành công! ID: ${info.messageId}`);
        return true;

    } catch (error) {
        // Log lỗi chi tiết ra để debug
        console.error("❌ Lỗi gửi mail (Chi tiết):");
        console.error(error);
        
        // QUAN TRỌNG: Ném lỗi ra ngoài để Controller biết mà dừng lại
        throw new Error("Không thể gửi email: " + error.message);
    }
};

export default sendEmail;