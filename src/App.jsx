import { useState, useEffect } from 'react';
import { Fab, useMediaQuery, useTheme } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import ChatbotSection from './components/ChatbotSection';
import EventsSection from './components/EventsSection';
import UserTasksButton from './components/UserTasksButton';
import { startNotificationService } from './services/notificationService';

function App() {
  const [showEvents, setShowEvents] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    startNotificationService();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white py-3 px-4 shadow-md">
        <div className="flex items-center justify-center gap-2">
          <img src="/bol.svg" alt="Logo" className="h-8 w-8" />
          <h1 className="text-xl md:text-2xl font-semibold text-center">
            Asistente Virtual - Servicios Publicos
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden p-2 md:p-4 relative">
        <div className="container mx-auto p-4 h-full">
          {/* Chat section - ajusta su ancho según si Events está visible */}
          <div 
            className={`flex-1 transition-all duration-300 ${
              showEvents ? 'md:mr-[300px]' : ''
            }`}
          >
            <ChatbotSection />
          </div>

          {/* Events section - fixed en móvil, side panel en desktop */}
          <div 
            className={`
              fixed md:absolute top-0 right-0 h-full 
              w-full md:w-[300px] 
              bg-white md:bg-transparent
              z-10 transition-transform duration-300
              ${showEvents ? 'translate-x-0' : 'translate-x-full'}
              ${isMobile ? 'p-4' : 'p-0 md:pt-0'}
            `}
          >
            <EventsSection isVisible={showEvents} />
          </div>

          {/* Floating button - ajusta posición en móvil */}
          <Fab
            color="primary"
            aria-label="toggle events"
            onClick={() => setShowEvents(!showEvents)}
            className={`
              fixed z-20 transition-all duration-300
              ${isMobile 
                ? 'bottom-3 right-4' 
                : 'top-4 right-4'}
            `}
            size={isMobile ? "medium" : "large"}
          >
            <EventIcon />
          </Fab>
          <UserTasksButton />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-2 px-4 text-center text-sm">
        <p> 2024 Asistente Virtual. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
