// API URL for the notification server
const API_URL = import.meta.env.PROD 
  ? 'https://your-notification-server.onrender.com'  // URL de producción
  : 'http://localhost:3001';  // URL de desarrollo

/**
 * Sends an event notification through the backend server
 * @param {string} phoneNumber - The recipient's phone number
 * @param {Object} eventDetails - Details of the event
 * @param {number} timeUntilEvent - Hours until the event (48, 24, or 1)
 * @returns {Promise<boolean>} - Success status of the notification
 */
export const sendEventNotification = async (phoneNumber, eventDetails, timeUntilEvent) => {
  try {
    const response = await fetch(`${API_URL}/api/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        eventDetails,
        timeUntilEvent
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};
