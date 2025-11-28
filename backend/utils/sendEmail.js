import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Dùng SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 1. Kiểm tra kết nối SMTP trước khi gửi
        await transporter.verify();
        console.log("✅ Kết nối SMTP thành công. Đang gửi mail...");

        // 2. Gửi mail
        await transporter.sendMail({
            from: `"Shop Sách 3 Anh Em" <${process.env.EMAIL_USER}>`, // Thêm tên hiển thị cho uy tín
            to: email,
            subject: subject,
            text: text,
        });

        console.log(`📧 Email đã gửi thành công đến: ${email}`);
        return true; // Trả về true nếu thành công

    } catch (error) {
        console.error("❌ Gửi email thất bại. Chi tiết lỗi:");
        console.error(error);
        return false; // Trả về false nếu thất bại
    }
};

export default sendEmail;