import { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Button, Card, CardContent, Link, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
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
      backgroundColor: '#f5f5f5', // Fondo gris claro
      padding: '20px',
      height: '100%',
      overflowY: 'auto'
    },
    messageContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    botMessage: {
      backgroundColor: '#ffffff', // Fondo blanco para mensajes del bot
      color: '#000000', // Texto negro para mensajes del bot
      padding: '10px 15px',
      borderRadius: '15px',
      maxWidth: '80%',
      alignSelf: 'flex-start',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },
    userMessage: {
      backgroundColor: '#616161', // Gris oscuro para mensajes del usuario
      color: '#ffffff', // Texto blanco para mensajes del usuario
      padding: '10px 15px',
      borderRadius: '15px',
      maxWidth: '80%',
      alignSelf: 'flex-end',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
    }
  };

  // Función para desplazarse al último mensaje
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      const height = chatContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      
      chatContainerRef.current.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
      });
    }
  };

  // Desplazarse cuando se agregan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    handleInitialMessage();
  }, []);

  const handleInitialMessage = () => {
    setMessages([{
      type: 'bot',
      content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?'
    }]);
    setShowOptions(true);
    setCurrentSearchType(null);
    setInputText('');
  };

  const handleUserInput = async (option) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: option
    }]);
    setShowOptions(false);

    if (option === 'Terminar chat') {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: '¡Gracias por usar el asistente virtual! Iniciando una nueva conversación...'
      }]);
      
      setTimeout(() => {
        handleInitialMessage();
      }, 2000);
      return;
    }

    setCurrentSearchType(option === 'Consulta por radicado' ? 'radicado' : 'asunto');
    setMessages(prev => [...prev, {
      type: 'bot',
      content: 'Por favor, ingresa el ' + (option === 'Consulta por radicado' ? 'número de radicado' : 'nombre del asunto') + ':'
    }]);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !currentSearchType) return;

    const searchTerm = inputText.trim();
    setMessages(prev => [...prev, {
      type: 'user',
      content: searchTerm
    }]);
    setInputText('');

    try {
      const data = await fetchSheetData(SHEET_NAMES.CASOS);
      let results;
      
      if (currentSearchType === 'radicado') {
        results = data.filter(row => 
          row.radicado && row.radicado.toString().toLowerCase() === searchTerm.toLowerCase()
        );
      } else {
        results = data.filter(row =>
          row.nombredelasunto && row.nombredelasunto.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (results.length === 0) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'No se encontraron resultados para tu búsqueda.'
        }]);
      } else {
        results.forEach(result => {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: (
              <Card variant="outlined" className="w-full my-2">
                <CardContent>
                  <Typography variant="h6" component="div">
                    Radicado: {result.radicado}
                  </Typography>
                  <Typography color="textSecondary">
                    Nombre del Asunto: {result.nombredelasunto}
                  </Typography>
                  <Typography>
                    Estado: {result.estado}
                  </Typography>
                  <Typography>
                    Asignado a: {result.asignadoa}
                  </Typography>
                  <Typography>
                    Fecha: {result.fecha}
                  </Typography>
                  <Typography>
                    Fecha estimada respuesta: {result.fechaestimadarespuesta}
                  </Typography>
                  {result.respuesta && (
                    <Typography>
                      Respuesta: {result.respuesta}
                    </Typography>
                  )}
                  {result.enlace && (
                    <Link 
                      href={result.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2"
                    >
                      Ver detalles
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          }]);
        });
      }

      setMessages(prev => [...prev, {
        type: 'bot',
        content: '¿Hay algo más en lo que pueda ayudarte?'
      }]);
      setShowOptions(true);
      setCurrentSearchType(null);

    } catch (error) {
      console.error('Error al realizar la busqueda:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Lo siento, ocurrió un error al procesar tu solicitud.'
      }]);
      setShowOptions(true);
      setCurrentSearchType(null);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: styles.chatContainer.backgroundColor
      }}
    >
      <div 
        ref={chatContainerRef}
        style={styles.chatContainer}
      >
        <div style={styles.messageContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={message.type === 'bot' ? styles.botMessage : styles.userMessage}
            >
              {typeof message.content === 'string' ? (
                message.content
              ) : (
                message.content
              )}
            </div>
          ))}
        </div>

        {/* Barra de entrada */}
        <form 
          onSubmit={handleSubmit}
          className="flex gap-2 mt-auto w-full pt-4"
        >
          <TextField
            fullWidth
            size="small"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe tu búsqueda..."
            disabled={!currentSearchType}
            className="flex-1"
          />
          <IconButton 
            type="submit" 
            color="primary"
            disabled={!currentSearchType || !inputText.trim()}
            className="min-w-[40px]"
          >
            <SendIcon />
          </IconButton>
        </form>

        {showOptions && (
          <div className="p-2">
            <Button
              variant="contained"
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => handleUserInput('Consulta por radicado')}
            >
              1. CONSULTA POR RADICADO
            </Button>
            <Button
              variant="contained"
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => handleUserInput('Consulta por asunto')}
            >
              2. CONSULTA POR ASUNTO
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleUserInput('Terminar chat')}
            >
              3. TERMINAR CHAT
            </Button>
          </div>
        )}
      </div>
    </Paper>
  );
};

export default ChatbotSection;
