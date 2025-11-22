import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Dùng SSL (quan trọng khi dùng port 465)
            auth: {
                user: process.env.EMAIL_USER, // Email của bạn (ví dụ: shopsach@gmail.com)
                pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password)
            },
            connectionTimeout: 10000,
        });
        

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.log("Email not sent", error);
        // Không throw error để tránh crash app, chỉ log lỗi
    }
};

export default sendEmail;