import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
        from: `"Phantom Projects" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });

    console.log('[EMAIL] Message sent to real Gmail: %s', info.messageId);

    return info;
};
