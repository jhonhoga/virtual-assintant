import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchSheetData, SHEET_NAMES } from '../utils/googleSheets';

const EventsSection = ({ isVisible }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const [datePart, timePart] = dateTimeStr.split(' ');
    const [day, month, year] = datePart.split('/').map(num => parseInt(num));
    return new Date(year, month - 1, day, 
      parseInt(timePart.split(':')[0]), 
      parseInt(timePart.split(':')[1])
    );
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchSheetData(SHEET_NAMES.EVENTOS);
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Procesar y filtrar eventos
        const upcomingEvents = data
          .filter(event => event.actividad && event.horadeinicio) // Asegurarse de que tenga datos básicos
          .map(event => {
            const startDate = parseDateTime(event.horadeinicio);
            const endDate = parseDateTime(event.horadefinalizacion);
            
            return {
              ...event,
              startDate,
              endDate
            };
          })
          .filter(event => {
            return event.startDate && event.startDate >= today && event.startDate <= nextWeek;
          })
          .sort((a, b) => a.startDate - b.startDate);

        setEvents(upcomingEvents);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
        setError(err.message || 'Error al cargar los eventos');
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      loadEvents();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="error" className="p-4">
        {error}
      </Typography>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  return (
    <Paper className="h-full p-4 overflow-y-auto">
      <Typography variant="h6" className="mb-4">
        Eventos Próximos
      </Typography>
      {events.length === 0 ? (
        <Typography>No hay eventos programados para los próximos 7 días</Typography>
      ) : (
        events.map((event, index) => (
          <Accordion key={index} className="mb-2">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className="bg-gray-50"
            >
              <div>
                <Typography className="font-bold">
                  {formatDate(event.startDate)}
                </Typography>
                <Typography color="textSecondary">
                  {formatTime(event.startDate)} - {event.actividad}
                </Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="space-y-2">
                <Typography>
                  <strong>Tipo de actividad:</strong> {event.tipodeactividad}
                </Typography>
                {event.endDate && (
                  <Typography>
                    <strong>Hora de finalización:</strong> {formatTime(event.endDate)}
                  </Typography>
                )}
                <Typography>
                  <strong>Ubicación:</strong> {event.ubicacion}
                </Typography>
                {event.notas && (
                  <Typography>
                    <strong>Notas:</strong> {event.notas}
                  </Typography>
                )}
                {event.enlace && (
                  <Link 
                    href={event.enlace} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    Ver más detalles
                  </Link>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
};

export default EventsSection;
