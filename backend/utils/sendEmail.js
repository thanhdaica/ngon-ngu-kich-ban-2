import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // TLS yêu cầu secure: false
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            // --- THÊM DÒNG NÀY ĐỂ FIX LỖI TIMEOUT ---
            family: 4, // Ép buộc sử dụng IPv4
        });

        console.log("⏳ Đang kết nối tới Gmail SMTP (IPv4)...");
        
        // Verify kết nối
        await transporter.verify();
        console.log("✅ Kết nối SMTP thành công!");

        // Gửi mail
        const info = await transporter.sendMail({
            from: `"Shop Sách 3 Anh Em" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        });

        console.log(`📧 Email đã gửi thành công đến: ${email}`);
        console.log("Message ID:", info.messageId);
        return true;

    } catch (error) {
        console.error("❌ Gửi email thất bại. Chi tiết lỗi:");
        console.error(error);
        return false;
    }
};

export default sendEmail;