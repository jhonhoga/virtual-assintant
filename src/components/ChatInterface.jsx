import { useState, useRef, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Card, 
  CardContent,
  Link,
  CircularProgress
} from '@mui/material';
import { fetchSheetData } from '../utils/googleSheets';

const ChatInterface = () => {
  const [messages, setMessages] = useState([{
    type: 'bot',
    content: '¡Hola! Bienvenido al Asistente Virtual. Por favor, selecciona una opción para continuar.',
    options: ['Consulta por Radicado', 'Consulta por Asunto', 'Terminar Chat']
  }]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentOption, setCurrentOption] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const ResultCard = ({ result }) => (
    <Card className="mb-4">
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Radicado: {result.radicado}
        </Typography>
        <Typography><strong>Fecha:</strong> {result.fecha}</Typography>
        <Typography><strong>Asunto:</strong> {result.nombredelasunto}</Typography>
        <Typography><strong>Asignado a:</strong> {result.asignadoa}</Typography>
        <Typography><strong>Estado:</strong> {result.estado}</Typography>
        <Typography><strong>Fecha estimada:</strong> {result.fechaestimadarespuesta}</Typography>
        <Typography><strong>Respuesta:</strong> {result.respuesta}</Typography>
        {result.enlace && (
          <Button 
            variant="contained" 
            color="primary" 
            href={result.enlace} 
            target="_blank"
            className="mt-2"
          >
            Mostrar enlace
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const handleSearch = async (searchType, searchValue) => {
    setLoading(true);
    try {
      const data = await fetchSheetData('Hoja 1');
      let results = [];

      if (searchType === 'radicado') {
        results = data.filter(item => 
          item.radicado.toString().toLowerCase() === searchValue.toLowerCase()
        );
      } else if (searchType === 'asunto') {
        results = data.filter(item =>
          item.nombredelasunto.toLowerCase().includes(searchValue.toLowerCase())
        );
      }

      if (results.length === 0) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `No se encontraron resultados para ${searchType === 'radicado' ? 'el radicado' : 'la búsqueda'} "${searchValue}"`,
          options: ['Consulta por Radicado', 'Consulta por Asunto', 'Terminar Chat']
        }]);
      } else {
        const resultMessage = {
          type: 'bot',
          content: 'Resultados encontrados:',
          results: results,
          options: ['Consulta por Radicado', 'Consulta por Asunto', 'Terminar Chat']
        };
        setMessages(prev => [...prev, resultMessage]);
      }
    } catch (error) {
      console.error('Error al buscar:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Lo siento, ocurrió un error al buscar. Por favor, intenta nuevamente.',
        options: ['Consulta por Radicado', 'Consulta por Asunto', 'Terminar Chat']
      }]);
    } finally {
      setLoading(false);
      setInputValue('');
      setCurrentOption(null);
    }
  };

  const handleOptionSelect = (option) => {
    if (option === 'Terminar Chat') {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Gracias por usar el Asistente Virtual. ¡Que tengas un buen día!',
        isEnding: true
      }]);
      return;
    }

    setMessages(prev => [...prev, {
      type: 'user',
      content: option
    }, {
      type: 'bot',
      content: option === 'Consulta por Radicado' 
        ? 'Por favor, ingresa el número de radicado:'
        : 'Por favor, ingresa la palabra clave o frase para buscar:',
      awaitingInput: true
    }]);
    setCurrentOption(option);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, {
      type: 'user',
      content: inputValue
    }]);

    const searchType = currentOption === 'Consulta por Radicado' ? 'radicado' : 'asunto';
    handleSearch(searchType, inputValue.trim());
  };

  return (
    <Paper 
      elevation={3} 
      className="p-4 h-[calc(100vh-200px)] flex flex-col"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      <Typography variant="h5" className="mb-4">
        Chat con Asistente Virtual
      </Typography>
      
      <div 
        className="flex-grow overflow-y-auto mb-4 p-4"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
      >
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <Typography 
              variant="body1" 
              className="mb-2"
              sx={{
                backgroundColor: message.type === 'user' ? '#e3f2fd' : '#f5f5f5',
                padding: '1rem',
                borderRadius: '8px',
                maxWidth: '80%',
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {message.content}
            </Typography>
            
            {message.results && message.results.map((result, idx) => (
              <ResultCard key={idx} result={result} />
            ))}
            
            {message.options && !message.isEnding && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOptionSelect(option)}
                    disabled={loading}
                    className="mb-2"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!messages[messages.length - 1].isEnding && (
        <form onSubmit={handleInputSubmit} className="mt-auto">
          <div className="flex gap-2">
            <TextField
              fullWidth
              variant="outlined"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!messages[messages.length - 1].awaitingInput || loading}
              placeholder={currentOption === 'Consulta por Radicado' 
                ? 'Ingresa el número de radicado...' 
                : currentOption === 'Consulta por Asunto'
                  ? 'Ingresa palabra clave o frase...'
                  : 'Selecciona una opción...'}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!messages[messages.length - 1].awaitingInput || loading}
            >
              Enviar
            </Button>
          </div>
        </form>
      )}
    </Paper>
  );
};

export default ChatInterface;
