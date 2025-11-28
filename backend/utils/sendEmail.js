import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.office365.com", // Đổi sang host chuẩn này của Microsoft
            port: 587,
            secure: false, // STARTTLS
            auth: {
                user: process.env.EMAIL_USER, // Email Outlook của bạn
                pass: process.env.EMAIL_PASS, // Mật khẩu đăng nhập Outlook
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false 
            },
            // QUAN TRỌNG: Dòng này ép Node.js chỉ dùng IPv4, tránh bị treo
            family: 4, 
            // Tăng thời gian chờ
            connectionTimeout: 20000, 
            greetingTimeout: 10000,
        });

        console.log(`⏳ Đang kết nối Outlook (IPv4) để gửi tới: ${email}...`);

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
        console.error(error.message || error);
        return false;
    }
};

export default sendEmail;