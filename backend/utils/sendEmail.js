import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            family: 4, // Ép buộc dùng IPv4 để tránh lỗi mạng
            // --- THÊM CẤU HÌNH TIMEOUT ĐỂ TRÁNH TREO APP ---
            connectionTimeout: 10000, // 10 giây không kết nối được thì hủy
            greetingTimeout: 5000,    // 5 giây không chào hỏi được thì hủy
            socketTimeout: 10000,     // 10 giây không gửi được dữ liệu thì hủy
        });

        console.log(`⏳ Đang gửi email tới: ${email}...`);

        // BỎ QUA transporter.verify() vì nó hay gây treo trên Render
        
        // Gửi mail luôn
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
        // In lỗi gọn gàng hơn để dễ đọc
        console.error(error.message || error); 
        return false;
    }
};

export default sendEmail;