import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            // Clean the password: remove spaces AND quotes which might be in the string
            pass: process.env.EMAIL_PASS?.replace(/[\s"]/g, ''),
        },
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 45000,
        logger: true, // Log to console
        debug: true,  // Include SMTP traffic in logs
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
