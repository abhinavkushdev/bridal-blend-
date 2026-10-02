import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const WHATSAPP_PHONE = process.env.WHATSAPP_NUMBER || '917488757959';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, message: 'BridalBlend backend is running.' });
});

app.post('/api/booking', async (req, res) => {
    const booking = req.body || {};
    const message = [
        'Hi BridalBlend, I would like to book a consultation.',
        '',
        `Service: ${booking.service || 'Not provided'}`,
        `Name: ${booking.name || 'Not provided'}`,
        `Email: ${booking.email || 'Not provided'}`,
        `Phone: ${booking.phone || 'Not provided'}`,
        `Date: ${booking.dateLabel || 'Not selected'}`,
        `Time: ${booking.slot || 'Not selected'}`,
        `Wedding date: ${booking.weddingDate || 'Not provided'}`,
    ].join('\n');

    try {
        if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            return res.status(400).json({
                ok: false,
                message: 'WhatsApp API credentials are not configured.',
            });
        }

        const response = await fetch(
            `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: WHATSAPP_PHONE,
                    type: 'text',
                    text: {
                        body: message,
                    },
                }),
            },
        );

        const result = await response.json();

        if (!response.ok) {
            return res.status(500).json({
                ok: false,
                message: 'WhatsApp send failed.',
                details: result,
            });
        }

        return res.json({ ok: true, message: 'Booking sent to WhatsApp successfully.' });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            message: 'Server error while sending booking to WhatsApp.',
            details: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`BridalBlend backend running on http://localhost:${PORT}`);
});
