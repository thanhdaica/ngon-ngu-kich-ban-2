import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        // Sử dụng 'service: gmail' để Nodemailer tự động cấu hình port/host chuẩn nhất
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // Thêm timeout để tránh bị treo server
            connectionTimeout: 10000, 
            greetingTimeout: 5000,
        });

        console.log(`⏳ Đang gửi email tới: ${email}...`);

        const info = await transporter.sendMail({
            from: `"Shop Sách 3 Anh Em" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        });

        console.log(`✅ Email đã gửi thành công! ID: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error("❌ Gửi email thất bại. Chi tiết lỗi:");
        console.error(error.message || error); // Log message lỗi cho gọn
        return false;
    }
};

export default sendEmail;