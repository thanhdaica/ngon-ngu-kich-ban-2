// backend/utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,              // <--- ĐỔI CỔNG THÀNH 465
            secure: true,           // <--- BẮT BUỘC TRUE VỚI CỔNG 465
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
            // Vẫn giữ lại các cấu hình này để tối ưu mạng
            family: 4, 
            connectionTimeout: 10000, 
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });

        console.log(`⏳ Đang kết nối Gmail (Port 465 - SSL) để gửi tới: ${email}...`);

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
        console.error("❌ Lỗi gửi mail (Chi tiết):");
        // In ra mã lỗi cụ thể để debug
        if (error.code === 'EAUTH') {
            console.error("--> Sai Email hoặc Mật khẩu ứng dụng.");
        } else if (error.code === 'ETIMEDOUT') {
            console.error("--> Mạng Render bị chặn kết nối đến Gmail.");
        }
        console.error(error);
        
        throw new Error("Không thể gửi email: " + error.message);
    }
};

export default sendEmail;