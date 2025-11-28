import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 1. Kiểm tra kết nối SMTP xem user/pass có đúng không
        await transporter.verify(); 
        console.log("✅ Kết nối SMTP thành công. Đang gửi mail...");

        // 2. Gửi mail
        const info = await transporter.sendMail({
            from: `"Shop Sách 3 Anh Em" <${process.env.EMAIL_USER}>`, // Thêm tên hiển thị cho uy tín
            to: email,
            subject: subject,
            text: text, 
            // html: `<b>${text}</b>`, // Nếu muốn gửi HTML
        });

        console.log("📧 Email sent successfully!");
        console.log("Message ID:", info.messageId); // In ra ID của mail để tra soát
        return true;

    } catch (error) {
        console.error("❌ Email not sent. Error details:");
        console.error(error); // In chi tiết lỗi
        return false;
    }
};

export default sendEmail;