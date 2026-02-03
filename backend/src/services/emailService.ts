import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            // Strip any quotes or spaces that might have sneaked into the env variable
            pass: process.env.EMAIL_PASS?.replace(/[\s"']/g, ''),
        },
        tls: {
            // Do not fail on invalid certs (common on Render/Vercel)
            rejectUnauthorized: false
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        logger: true,
        debug: true,
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
