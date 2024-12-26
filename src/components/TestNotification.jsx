import { useState } from 'react';
import { Button, TextField, Paper, Typography, Snackbar, Alert } from '@mui/material';
import { sendTestNotification } from '../services/testNotification';

const TestNotification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await sendTestNotification(phoneNumber);
      setNotification({
        open: true,
        message: success 
          ? 'Mensaje de prueba enviado correctamente' 
          : 'Error al enviar el mensaje de prueba',
        severity: success ? 'success' : 'error'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error al enviar el mensaje de prueba',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Prueba de Notificaciones SMS
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Número de teléfono"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+573001234567"
          margin="normal"
          helperText="Ingresa el número en formato internacional (ej: +573001234567)"
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading || !phoneNumber}
          sx={{ mt: 2 }}
        >
          {loading ? 'Enviando...' : 'Enviar mensaje de prueba'}
        </Button>
      </form>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TestNotification;
