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
    setMessages(prev => [...prev, {
      type: 'user',
      text: option
    }]);
    setShowOptions(false);

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

    setCurrentSearchType(option === 'Consulta por radicado' ? 'radicado' : 'asunto');
    setMessages(prev => [...prev, {
      type: 'bot',
      text: 'Por favor, ingresa el ' + (option === 'Consulta por radicado' ? 'número de radicado' : 'nombre del asunto') + ':'
    }]);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !currentSearchType) return;

    const searchTerm = inputText.trim();
    setMessages(prev => [...prev, {
      type: 'user',
      text: searchTerm
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
          text: 'No se encontraron resultados para tu búsqueda.'
        }]);
      } else {
        results.forEach(result => {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: (
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
        text: '¿Hay algo más en lo que pueda ayudarte?'
      }]);
      setShowOptions(true);
      setCurrentSearchType(null);

    } catch (error) {
      console.error('Error al realizar la busqueda:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Lo siento, ocurrió un error al procesar tu solicitud.'
      }]);
      setShowOptions(true);
      setCurrentSearchType(null);
    }
  };

  return (
    <Paper elevation={3} sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <div ref={chatContainerRef} style={styles.chatContainer}>
        <div style={styles.messageContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={message.type === 'user' ? styles.userMessage : styles.botMessage}
            >
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
          ))}
        </div>

        <div style={styles.inputContainer}>
          {showOptions ? (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleUserInput('Consulta por Radicado')}
              >
                Consulta por Radicado
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleUserInput('Consulta por Asunto')}
              >
                Consulta por Asunto
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleUserInput('Terminar chat')}
              >
                Terminar chat
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <TextField
                fullWidth
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={
                  currentSearchType === 'radicado'
                    ? 'Ingrese el número de radicado'
                    : 'Ingrese el asunto a buscar'
                }
              />
              <IconButton
                color="primary"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
              >
                <SendIcon />
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </Paper>
  );
};

export default ChatbotSection;
