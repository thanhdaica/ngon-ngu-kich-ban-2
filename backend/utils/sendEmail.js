import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com", // Dùng Host của Outlook
            port: 587,
            secure: false, // Outlook dùng port 587 với secure: false
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false // Bỏ qua lỗi chứng chỉ nếu có
            },
            // Tăng thời gian chờ để không bị ngắt kết nối sớm
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000,
        });

        console.log(`⏳ Đang gửi email tới: ${email} qua Outlook...`);

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