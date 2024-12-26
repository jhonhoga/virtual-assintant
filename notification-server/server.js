import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-url.onrender.com', 'http://localhost:5173']
    : 'http://localhost:5173'
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    twilioConfigured: !!(accountSid && authToken && twilioPhoneNumber)
  });
});

// Utility function to format date for messages
const formatDateTime = (dateTimeStr) => {
  const [date, time] = dateTimeStr.split(' ');
  return `${date} a las ${time}`;
};

// Utility function to format phone number
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Ensure it starts with +
  return cleaned.startsWith('57') ? `+${cleaned}` : `+57${cleaned}`;
};

// Send notification endpoint
app.post('/api/send-notification', async (req, res) => {
  try {
    const { phoneNumber, eventDetails, timeUntilEvent } = req.body;

    console.log('Received notification request:', {
      phoneNumber,
      eventDetails,
      timeUntilEvent
    });

    if (!phoneNumber || !eventDetails || !timeUntilEvent) {
      console.log('Missing required fields:', {
        phoneNumber: phoneNumber ? '✓' : '✗',
        eventDetails: eventDetails ? '✓' : '✗',
        timeUntilEvent: timeUntilEvent ? '✓' : '✗'
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    let message = `Recordatorio: El evento "${eventDetails.Actividad}" `;
    
    if (timeUntilEvent === 48) {
      message += `comenzará en 2 días (${formatDateTime(eventDetails['Hora de inicio'])}).`;
    } else if (timeUntilEvent === 24) {
      message += `comenzará mañana (${formatDateTime(eventDetails['Hora de inicio'])}).`;
    } else if (timeUntilEvent === 1) {
      message += `comenzará en 1 hora (${formatDateTime(eventDetails['Hora de inicio'])}).`;
    }

    message += ` Lugar: ${eventDetails['Ubicación'] || 'No especificado'}`;
    
    if (eventDetails['Notas']) {
      message += `. Orden día: ${eventDetails['Notas']}`;
    }

    if (eventDetails['Enlace']) {
      message += `. Link: ${eventDetails['Enlace']}`;
    }

    console.log('Sending message:', {
      to: formatPhoneNumber(phoneNumber),
      from: twilioPhoneNumber,
      messageLength: message.length,
      message: message
    });

    const result = await client.messages.create({
      body: message,
      to: formatPhoneNumber(phoneNumber),
      from: twilioPhoneNumber
    });

    console.log(`SMS sent successfully. SID: ${result.sid}`);
    res.json({ success: true, messageId: result.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.details || 'No additional details available'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

app.listen(port, () => {
  console.log(`Notification server running on port ${port}`);
  console.log('Environment:', {
    accountSid: accountSid ? '✓' : '✗',
    authToken: authToken ? '✓' : '✗',
    twilioPhone: twilioPhoneNumber ? '✓' : '✗'
  });
});
