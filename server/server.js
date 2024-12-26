import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

app.use(cors());
app.use(express.json());

app.post('/api/send-notification', async (req, res) => {
  try {
    const { phoneNumber, eventDetails, timeUntilEvent } = req.body;

    let message = `Recordatorio: El evento "${eventDetails.actividad}" `;
    
    if (timeUntilEvent === 24) {
      message += `comenzará mañana a las ${eventDetails.horadeinicio}.`;
    } else if (timeUntilEvent === 12) {
      message += `comenzará en 12 horas (${eventDetails.horadeinicio}).`;
    } else if (timeUntilEvent === 1) {
      message += `comenzará en 1 hora (${eventDetails.horadeinicio}).`;
    }

    message += ` Lugar: ${eventDetails.lugar || 'No especificado'}`;

    const result = await client.messages.create({
      body: message,
      to: phoneNumber,
      from: twilioPhoneNumber
    });

    res.json({ success: true, messageId: result.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
