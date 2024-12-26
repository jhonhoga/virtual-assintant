import { fetchSheetData, SHEET_NAMES } from '../utils/googleSheets';
import { sendEventNotification } from './twilioService';

// Registro de notificaciones enviadas
const sentNotifications = new Map();

// Función para calcular las horas hasta un evento
const getHoursUntilEvent = (eventDate) => {
  const now = new Date();
  const diffInHours = (eventDate - now) / (1000 * 60 * 60);
  return Math.floor(diffInHours);
};

// Función para parsear la fecha y hora
const parseDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return null;
  const [datePart, timePart] = dateTimeStr.split(' ');
  const [day, month, year] = datePart.split('/').map(num => parseInt(num));
  return new Date(year, month - 1, day, 
    parseInt(timePart.split(':')[0]), 
    parseInt(timePart.split(':')[1])
  );
};

// Función para generar una clave única para cada notificación
const getNotificationKey = (event, hoursUntilEvent) => {
  return `${event.actividad}-${event.horadeinicio}-${hoursUntilEvent}`;
};

// Función principal para verificar y enviar notificaciones
export const checkAndSendNotifications = async () => {
  try {
    console.log('Verificando eventos para notificaciones...');
    const events = await fetchSheetData(SHEET_NAMES.EVENTOS);
    const now = new Date();

    // Limpiar notificaciones antiguas (más de 24 horas)
    for (const [key, timestamp] of sentNotifications.entries()) {
      if (now - timestamp > 24 * 60 * 60 * 1000) {
        sentNotifications.delete(key);
      }
    }

    for (const event of events) {
      // Verificar que el evento tenga todos los campos requeridos
      if (!event.actividad || !event.horadeinicio || !event.telefono) {
        console.log('Evento incompleto, falta información requerida:', {
          actividad: event.actividad ? '✓' : '✗',
          horaInicio: event.horadeinicio ? '✓' : '✗',
          telefono: event.telefono ? '✓' : '✗'
        });
        continue;
      }

      const startDate = parseDateTime(event.horadeinicio);
      if (!startDate) {
        console.log(`No se pudo parsear la fecha del evento: "${event.horadeinicio}" para la actividad "${event.actividad}"`);
        continue;
      }

      const hoursUntilEvent = getHoursUntilEvent(startDate);
      console.log(`Evento: ${event.actividad}, Fecha: ${event.horadeinicio}, Horas hasta el evento: ${hoursUntilEvent}`);

      // Verificar los intervalos de notificación (48h, 24h, 1h)
      if ([48, 24, 1].includes(hoursUntilEvent)) {
        const notificationKey = getNotificationKey(event, hoursUntilEvent);
        
        // Verificar si ya se envió esta notificación
        if (sentNotifications.has(notificationKey)) {
          console.log(`Notificación ya enviada para: ${event.actividad} (${hoursUntilEvent}h)`);
          continue;
        }

        console.log(`Preparando notificación para el evento: ${event.actividad}`);
        console.log('Datos del evento:', {
          actividad: event.actividad,
          horaInicio: event.horadeinicio,
          telefono: event.telefono,
          ubicacion: event.ubicacion || 'No especificada',
          notas: event.notas || 'Sin notas',
          enlace: event.enlace || 'Sin enlace'
        });

        const eventData = {
          Actividad: event.actividad,
          'Hora de inicio': event.horadeinicio,
          'Hora de finalización': event.horadefinalizacion,
          'Ubicación': event.ubicacion,
          'Enlace': event.enlace,
          'Notas': event.notas,
          'Teléfono': event.telefono
        };
        
        try {
          await sendEventNotification(
            event.telefono,
            eventData,
            hoursUntilEvent
          );
          // Registrar la notificación como enviada
          sentNotifications.set(notificationKey, now.getTime());
          console.log(`✓ Notificación enviada con éxito para: ${event.actividad}`);
        } catch (error) {
          console.error(`✗ Error al enviar notificación para: ${event.actividad}`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error al verificar notificaciones:', error);
  }
};

// Iniciar el servicio de notificaciones
export const startNotificationService = () => {
  console.log('Iniciando servicio de notificaciones...');
  
  // Verificar cada 5 minutos
  const INTERVAL = 5 * 60 * 1000; // 5 minutos en milisegundos
  setInterval(checkAndSendNotifications, INTERVAL);
  
  // También ejecutar inmediatamente al iniciar
  checkAndSendNotifications();
};
