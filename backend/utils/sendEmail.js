// backend/utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // <--- Sửa thành 'gmail' cho gọn, không cần điền host/port
            auth: {
                user: process.env.EMAIL_USER, // Địa chỉ Gmail của bạn
                pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng 16 ký tự (KHÔNG PHẢI PASS GMAIL THƯỜNG)
            },
        });

        console.log(`⏳ Đang gửi mail tới: ${email}...`);

        await transporter.sendMail({
            from: `"Shop Sách 3 Anh Em" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("✅ Email gửi thành công!");
    } catch (error) {
        console.error("❌ Lỗi gửi mail:", error);
    }
};

export default sendEmail;