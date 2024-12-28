import { useState } from 'react';
import { 
  Fab, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import { fetchSheetData, SHEET_NAMES } from '../utils/googleSheets';

const USERS = [
  'Jorge V',
  'Diana S',
  'Monica',
  'Maria A',
  'Nelcy',
  'Jhon',
  'Estefani',
  'Daniela'
];

const UserTasksButton = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserSelect = async (user) => {
    setAnchorEl(null);
    setSelectedUser(user);
    
    try {
      const data = await fetchSheetData(SHEET_NAMES.CASOS);
      const userTasks = data
        .filter(item => 
          item.asignadoa === user && 
          item.estado?.toLowerCase() === 'sin respuesta'
        )
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10);

      setTasks(userTasks);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setTasks([]);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="user tasks"
        style={{
          position: 'fixed',
          bottom: 90,
          right: 16,
          zIndex: 1000
        }}
        onClick={handleClick}
      >
        <PersonIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {USERS.map((user) => (
          <MenuItem 
            key={user} 
            onClick={() => handleUserSelect(user)}
            sx={{ minWidth: 150 }}
          >
            {user}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Últimos 10 radicados sin respuesta de {selectedUser}
            </Typography>
            <IconButton onClick={handleDialogClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {tasks.map((task, index) => (
              <ListItem key={index}>
                <Card sx={{ width: '100%', mb: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Radicado: {task.radicado}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Asunto: {task.nombredelasunto}
                    </Typography>
                    <Typography>
                      Fecha: {task.fecha}
                    </Typography>
                    <Typography>
                      Estado: {task.estado}
                    </Typography>
                    {task.enlace && (
                      <Typography>
                        <a 
                          href={task.enlace} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#1976d2', textDecoration: 'none' }}
                        >
                          Ver documento
                        </a>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </ListItem>
            ))}
            {tasks.length === 0 && (
              <Typography color="textSecondary" align="center" sx={{ mt: 2 }}>
                No hay radicados sin respuesta para este usuario
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserTasksButton;
