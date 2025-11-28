import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587, // <--- SỬA LẠI: Đổi từ 465 sang 587
            secure: false, // <--- SỬA LẠI: Với port 587 thì secure phải là false
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // Thêm cấu hình TLS để tránh lỗi chứng chỉ trên Render
            tls: {
                rejectUnauthorized: false
            }
        });

        // 1. Kiểm tra kết nối SMTP
        // Lưu ý: Trên một số server, lệnh verify() cũng có thể bị timeout, 
        // nên ta có thể bỏ qua bước này hoặc dùng timeout ngắn.
        // Tuy nhiên, cứ để thử xem log có báo connected không.
        console.log("⏳ Đang kết nối tới Gmail SMTP...");
        
        // 2. Gửi mail
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
        console.error(error); // In ra lỗi để đọc trên Render Logs
        return false; 
    }
};

export default sendEmail;