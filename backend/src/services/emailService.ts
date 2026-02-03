import { Resend } from 'resend';

// Initialize Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Phantom Projects <onboarding@resend.dev>', // Resend's default test sender
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('[RESEND ERROR] Detailed failure:', error);
            throw error;
        }

        console.log('[RESEND] Email sent successfully:', data?.id);
        return data;
    } catch (error) {
        console.error('[RESEND ERROR] Uncaught failure:', error);
        throw error;
    }
};
