const API_URL = 'http://localhost:3001';

export const sendTestNotification = async (phoneNumber) => {
  try {
    const response = await fetch(`${API_URL}/api/test-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber })
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data.success;
  } catch (error) {
    console.error('Error al enviar notificación de prueba:', error);
    return false;
  }
};
