import { useState } from 'react';
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
    <Paper className="h-full p-4 flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded-lg ${
              message.type === 'user' 
                ? 'bg-primary text-white' 
                : 'bg-slate-50'
            }`}>
              <Typography>{message.content}</Typography>
              
              {message.results && message.results.map((result, idx) => (
                <ResultCard key={idx} result={result} />
              ))}

              {message.options && !message.isEnding && (
                <div className="mt-3">
                  {message.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="contained"
                      color="primary"
                      size="small"
                      className="mr-2 mb-2"
                      onClick={() => handleOptionSelect(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-center">
            <CircularProgress size={24} />
          </div>
        )}
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
