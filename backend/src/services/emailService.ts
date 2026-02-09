import { Resend } from 'resend';

// Initialize Resend with API Key from environment variables
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!resend) {
        console.log('[DEV] Email Service Mocked (No API Key). Email would be sent to:', to);
        console.log('[DEV] Subject:', subject);
        return { id: 'mock-email-id' };
    }

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
