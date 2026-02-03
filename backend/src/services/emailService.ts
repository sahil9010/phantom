import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s/g, ''), // Remove spaces if any
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
    });

    try {
        const info = await transporter.sendMail({
            from: `"Phantom Projects" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log('[EMAIL] Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('[EMAIL ERROR] Detailed failure:', error);
        throw error; // Re-throw so the controller knows it failed
    }
};
