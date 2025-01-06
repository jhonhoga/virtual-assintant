import { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Button, Card, CardContent, Link, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search'; // Icono para consulta
import AssignmentIcon from '@mui/icons-material/Assignment'; // Icono para radicado
import CloseIcon from '@mui/icons-material/Close'; // Icono para terminar chat
import RobotIcon from '@mui/icons-material/SmartToy'; // Icono de robot para bot
import PersonIcon from '@mui/icons-material/Person'; // Icono de usuario
import { fetchSheetData, SHEET_NAMES } from '../utils/googleSheets';

const ChatbotSection = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentSearchType, setCurrentSearchType] = useState(null);
  const [showOptions, setShowOptions] = useState(true);
  const chatContainerRef = useRef(null);

  // Estilos personalizados
  const styles = {
    chatContainer: {
      backgroundColor: '#f5f5f5',
      padding: '20px',
      height: 'calc(100vh - 300px)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column'
    },
    messageContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '10px',
      flexGrow: 1
    },
    botMessage: {
      backgroundColor: '#ffffff',
      color: '#000000',
      padding: '10px 15px',
      borderRadius: '15px',
      maxWidth: '80%',
      alignSelf: 'flex-start',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      marginBottom: '10px'
    },
    userMessage: {
      backgroundColor: '#616161',
      color: '#ffffff',
      padding: '10px 15px',
      borderRadius: '15px',
      maxWidth: '80%',
      alignSelf: 'flex-end',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      marginBottom: '10px'
    },
    inputContainer: {
      position: 'sticky',
      bottom: 0,
      backgroundColor: '#f5f5f5',
      padding: '10px 0',
      marginTop: 'auto'
    }
  };

  // Inicializar el chat con un mensaje de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        type: 'bot',
        text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?'
      }]);
    }
  }, []);

  // Función para desplazarse al último mensaje
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Efecto para scroll automático cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInitialMessage = () => {
    setMessages([{
      type: 'bot',
      text: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
    }]);
    setShowOptions(true);
    setCurrentSearchType(null);
    setInputText('');
  };

  const handleUserInput = async (option) => {
    const userMessage = {
      type: 'user',
      text: option
    };
    setMessages(prev => [...prev, userMessage]);

    if (option === 'Terminar chat') {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: '¡Gracias por usar el asistente virtual! Iniciando una nueva conversación...'
      }]);
      
      setTimeout(() => {
        handleInitialMessage();
      }, 2000);
      return;
    }

    const searchType = option === 'Consulta por Radicado' ? 'radicado' : 'asunto';
    setCurrentSearchType(searchType);
    setShowOptions(false);

    const botResponse = {
      type: 'bot',
      text: `Por favor, ingresa ${searchType === 'radicado' ? 'el número de radicado' : 'el asunto'} a buscar:`
    };
    setMessages(prev => [...prev, botResponse]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentSearchType) return;

    const searchTerm = inputText.trim();
    setMessages(prev => [...prev, {
      type: 'user',
      text: searchTerm
    }]);
    setInputText('');

    try {
      const data = await fetchSheetData(SHEET_NAMES.CASOS);
      let results = [];

      if (currentSearchType === 'radicado') {
        results = data.filter(item => 
          item.radicado && item.radicado.toString().toLowerCase() === searchTerm.toLowerCase()
        );
      } else {
        results = data.filter(item =>
          item.nombredelasunto && 
          item.nombredelasunto.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (results.length === 0) {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: `No se encontraron resultados para ${currentSearchType === 'radicado' ? 'el radicado' : 'el asunto'} "${searchTerm}"`
        }]);
      } else {
        const resultsMessage = {
          type: 'bot',
          text: `Se encontraron ${results.length} resultado(s):`,
          results: results
        };
        setMessages(prev => [...prev, resultsMessage]);
      }

      // Preguntar si desea realizar otra consulta
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: '¿Deseas realizar otra consulta?'
        }]);
        setShowOptions(true);
        setCurrentSearchType(null);
      }, 1000);

    } catch (error) {
      console.error('Error al realizar la búsqueda:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.'
      }]);
      setShowOptions(true);
      setCurrentSearchType(null);
    }
  };

  // Renderizar opciones con iconos
  const renderOptions = () => {
    const options = [
      { 
        label: 'Consulta por Radicado', 
        icon: <AssignmentIcon />,
        color: 'primary'
      },
      { 
        label: 'Consulta por Asunto', 
        icon: <SearchIcon />,
        color: 'secondary'
      },
      { 
        label: 'Terminar chat', 
        icon: <CloseIcon />,
        color: 'error'
      }
    ];

    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px', 
        marginTop: '10px' 
      }}>
        {options.map((option, index) => (
          <Button
            key={index}
            variant="contained"
            color={option.color}
            startIcon={option.icon}
            onClick={() => handleUserInput(option.label)}
            fullWidth
          >
            {option.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <Paper elevation={3} sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <div ref={chatContainerRef} style={styles.chatContainer}>
        <div style={styles.messageContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...( message.type === 'user' ? styles.userMessage : styles.botMessage ),
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {message.type === 'bot' ? (
                <RobotIcon color="primary" />
              ) : (
                <PersonIcon color="secondary" />
              )}
              <div>
                <Typography>{message.text}</Typography>
                {message.results && (
                  <div style={{ marginTop: '10px' }}>
                    {message.results.map((result, idx) => (
                      <Card key={idx} sx={{ marginTop: 1, marginBottom: 1 }}>
                        <CardContent>
                          <Typography variant="h6">Radicado: {result.radicado}</Typography>
                          <Typography>Asunto: {result.nombredelasunto}</Typography>
                          <Typography>Estado: {result.estado}</Typography>
                          <Typography>Fecha: {result.fecha}</Typography>
                          {result.enlace && (
                            <Link href={result.enlace} target="_blank" rel="noopener">
                              Ver documento
                            </Link>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showOptions && renderOptions()}

        {!showOptions && (
          <form onSubmit={handleSubmit} style={styles.inputContainer}>
            <TextField
              fullWidth
              variant="outlined"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ingrese ${currentSearchType === 'radicado' ? 'el número de radicado' : 'el asunto'}`}
              InputProps={{
                endAdornment: (
                  <IconButton type="submit" color="primary">
                    <SendIcon />
                  </IconButton>
                )
              }}
            />
          </form>
        )}
      </div>
    </Paper>
  );
};

export default ChatbotSection;
